// Email service stub - email functionality is being migrated
export const sendEmail = async ({ to, template, from }: any): Promise<boolean> => {
  console.log("Email service is being migrated - email not sent:", { to, subject: template.subject, from });
  return false;
};

export const sendOrderApprovedEmail = async (userEmail: string, orderName: string, brandName: string): Promise<boolean> => {
  console.log("Order approved email not sent (service migrating):", { userEmail, orderName, brandName });
  return false;
};

export const sendOrderRejectedEmail = async (userEmail: string, orderName: string, brandName: string, reason: string): Promise<boolean> => {
  console.log("Order rejected email not sent (service migrating):", { userEmail, orderName, brandName, reason });
  return false;
};

export const sendMediaApprovedEmail = async (userEmail: string, mediaName: string, isciCode: string, brandName: string): Promise<boolean> => {
  console.log("Media approved email not sent (service migrating):", { userEmail, mediaName, isciCode, brandName });
  return false;
};

export const sendMediaRejectedEmail = async (userEmail: string, mediaName: string, isciCode: string, brandName: string): Promise<boolean> => {
  console.log("Media rejected email not sent (service migrating):", { userEmail, mediaName, isciCode, brandName });
  return false;
};

export const sendWelcomeEmail = async (userEmail: string, firstName: string, lastName: string, companyName: string): Promise<boolean> => {
  console.log("Welcome email not sent (service migrating):", { userEmail, firstName, lastName, companyName });
  return false;
};
