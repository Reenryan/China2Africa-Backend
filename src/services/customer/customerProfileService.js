
import prisma from "../../config/database.js";

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export async function getCustomerProfile(userId) {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      customerNumber: true,
      firstName: true,
      lastName: true,
      businessType: true,
      organizationName: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          phone: true,
          isEmailVerified: true,
        },
      },
    },
  });

  if (!customer) {
    throw createError(
      "Customer profile not found.",
      404,
      "CUSTOMER_NOT_FOUND"
    );
  }

  return {
    id: customer.id,
    customer_number: customer.customerNumber,
    first_name: customer.firstName,
    last_name: customer.lastName,
    full_name: `${customer.firstName} ${customer.lastName}`,
    account_type: customer.businessType,
    organization_name: customer.organizationName,
    email: customer.user.email,
    phone: customer.user.phone,
    is_email_verified: customer.user.isEmailVerified,
    created_at: customer.createdAt,
  };
}