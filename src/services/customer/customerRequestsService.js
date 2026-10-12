
import { randomBytes } from "node:crypto";
import prisma from "../../config/database.js";
import AppError from "../../utils/AppError.js";

async function getCustomerId(userId) {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!customer) {
    throw new AppError(
      "Customer profile not found.",
      404,
      "CUSTOMER_NOT_FOUND"
    );
  }

  return customer.id;
}

function generateRequestNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();

  return `SR-${date}-${suffix}`;
}


export const getCustomerRequests = async (
  userId,
  { page = 1, limit = 20 } = {}
) => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!customer) {
    throw new AppError(
      "Customer profile not found.",
      404,
      "CUSTOMER_NOT_FOUND"
    );
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 20)
  );

  const skip = (safePage - 1) * safeLimit;

  const [requests, totalItems] = await prisma.$transaction([
    prisma.sourcingRequest.findMany({
      where: { customerId: customer.id },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      skip,
      take: safeLimit,
      select: {
        id: true,
        requestNumber: true,
        status: true,
        customerNote: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { requestItems: true },
        },
      },
    }),

    prisma.sourcingRequest.count({
      where: { customerId: customer.id },
    }),
  ]);

  return {
    items: requests.map((request) => ({
      id: request.id,
      request_number: request.requestNumber,
      status: request.status,
      customer_note: request.customerNote,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
      product_count: request._count.requestItems,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / safeLimit),
      has_next_page: safePage * safeLimit < totalItems,
      has_previous_page: safePage > 1,
    },
  };
};

export async function createCustomerRequest(userId, payload) {
  const customerId = await getCustomerId(userId);

  const request = await prisma.$transaction(async (tx) => {
    const createdRequest = await tx.sourcingRequest.create({
      data: {
        customerId,
        requestNumber: generateRequestNumber(),
        customerNote: payload.customer_note?.trim() || null,
        requestItems: {
          create: payload.items.map((item) => ({
            productName: item.product_name.trim(),
            description: item.description?.trim() || null,
            specifications: item.specifications?.trim() || null,
          })),
        },
      },
      include: {
        requestItems: {
          select: {
            id: true,
            productName: true,
            description: true,
            specifications: true,
            createdAt: true,
          },
        },
      },
    });

    return createdRequest;
  });

  return {
    id: request.id,
    request_number: request.requestNumber,
    status: request.status,
    customer_note: request.customerNote,
    items: request.requestItems.map((item) => ({
      id: item.id,
      product_name: item.productName,
      description: item.description,
      specifications: item.specifications,
      created_at: item.createdAt,
    })),
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  };
}

export async function getCustomerRequestById(userId, requestId) {
  const customerId = await getCustomerId(userId);

  const request = await prisma.sourcingRequest.findFirst({
    where: {
      id: requestId,
      customerId,
    },
    select: {
      id: true,
      requestNumber: true,
      status: true,
      customerNote: true,
      createdAt: true,
      updatedAt: true,
      requestItems: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productName: true,
          description: true,
          specifications: true,
          createdAt: true,
          updatedAt: true,
          images: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              imageUrl: true,
              status: true,
              createdAt: true,
            },
          },
          revisions: {
            orderBy: { revisionNumber: "desc" },
            select: {
              id: true,
              revisionNumber: true,
              productName: true,
              description: true,
              specifications: true,
              quantity: true,
              unit: true,
              status: true,
              confirmedAt: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new AppError(
      "Sourcing request not found.",
      404,
      "SOURCING_REQUEST_NOT_FOUND"
    );
  }

  return {
    id: request.id,
    request_number: request.requestNumber,
    status: request.status,
    customer_note: request.customerNote,
    items: request.requestItems.map((item) => ({
      id: item.id,
      product_name: item.productName,
      description: item.description,
      specifications: item.specifications,
      images: item.images.map((image) => ({
        id: image.id,
        image_url: image.imageUrl,
        status: image.status,
        created_at: image.createdAt,
      })),
      revisions: item.revisions.map((revision) => ({
        id: revision.id,
        revision_number: revision.revisionNumber,
        product_name: revision.productName,
        description: revision.description,
        specifications: revision.specifications,
        quantity: revision.quantity,
        unit: revision.unit,
        status: revision.status,
        confirmed_at: revision.confirmedAt,
        category: revision.category,
      })),
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })),
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  };
}