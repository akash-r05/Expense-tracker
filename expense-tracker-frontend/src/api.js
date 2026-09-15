const API_BASE_URL = "https://expense-tracker-b45q.onrender.com/api";

// ===============================
// USER-FRIENDLY ERROR HANDLER
// ===============================
const getFriendlyError = (message, defaultMessage) => {
  if (!message) {
    return defaultMessage;
  }

  const text = message.toLowerCase();

  // ===============================
  // AUTHENTICATION ERRORS
  // ===============================

  if (
  text.includes("email already registered") ||
  text.includes("email already exists")
) {
  return "An account with this email already exists. Please log in instead.";
}

  if (
    text.includes("invalid password") ||
    text.includes("incorrect password")
  ) {
    return "Incorrect password. Please try again.";
  }

if (
  text.includes("user not found") ||
  text.includes("user not found or inactive") ||
  text.includes("email not found")
) {
  return "No account found with this email. Please register first.";
}

  if (
    text.includes("invalid credentials") ||
    text.includes("wrong credentials")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  if (text.includes("password")) {
    return "There was a problem with your password. Please check it and try again.";
  }

  // ===============================
  // CATEGORY ERRORS
  // ===============================

  if (
    text.includes("category already exists") ||
    text.includes("category already registered")
  ) {
    return "This category already exists. Please choose a different name.";
  }

  if (text.includes("category")) {
    return "Unable to process the category. Please try again.";
  }

  // ===============================
  // EXPENSE ERRORS
  // ===============================

  if (text.includes("expense")) {
    return "Unable to process the expense. Please try again.";
  }

  // ===============================
  // BUDGET ERRORS
  // ===============================

  if (text.includes("budget")) {
    return "Unable to process the budget. Please try again.";
  }

  // ===============================
  // NETWORK / SERVER ERRORS
  // ===============================

  if (
    text.includes("failed to fetch") ||
    text.includes("network error") ||
    text.includes("networkerror") ||
    text.includes("fetch failed")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // ===============================
  // JSON / TECHNICAL ERRORS
  // ===============================

  if (
    text.includes("unexpected token") ||
    text.includes("is not valid json") ||
    text.includes("json.parse")
  ) {
    return "Something went wrong while processing your request. Please try again.";
  }

  return defaultMessage;
};


// ===============================
// SAFELY READ SERVER RESPONSE
// ===============================
const readResponse = async (response) => {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      error: responseText
    };
  }
};


// ===============================
// GET CATEGORIES
// ===============================
export const getCategories = async (userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories?userEmail=${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to load your categories. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to load your categories. Please try again."
      )
    );
  }
};


// ===============================
// GET EXPENSES
// ===============================
export const getExpenses = async (userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses?userEmail=${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to load your expenses. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to load your expenses. Please try again."
      )
    );
  }
};


// ===============================
// GET BUDGETS
// ===============================
export const getBudgets = async (userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/budgets?userEmail=${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to load your budgets. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to load your budgets. Please try again."
      )
    );
  }
};


// ===============================
// ADD EXPENSE
// ===============================
export const addExpense = async (expense, userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses?userEmail=${encodeURIComponent(userEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to add this expense. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to add this expense. Please try again."
      )
    );
  }
};


// ===============================
// UPDATE EXPENSE
// ===============================
export const updateExpense = async (id, expense, userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses/${id}?userEmail=${encodeURIComponent(userEmail)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to update this expense. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to update this expense. Please try again."
      )
    );
  }
};


// ===============================
// DELETE EXPENSE
// ===============================
export const deleteExpense = async (id, userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses/${id}?userEmail=${encodeURIComponent(userEmail)}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to delete this expense. Please try again."
        )
      );
    }

    return response.text();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to delete this expense. Please try again."
      )
    );
  }
};


// ===============================
// ADD BUDGET
// ===============================
export const addBudget = async (budget, userEmail, categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/budgets?userEmail=${encodeURIComponent(
        userEmail
      )}&categoryId=${categoryId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budget),
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to add this budget. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to add this budget. Please try again."
      )
    );
  }
};


// ===============================
// UPDATE BUDGET
// ===============================
export const updateBudget = async (
  id,
  budget,
  userEmail
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/budgets/${id}?userEmail=${encodeURIComponent(
        userEmail
      )}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budget),
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to update this budget. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to update this budget. Please try again."
      )
    );
  }
};


// ===============================
// DELETE BUDGET
// ===============================
export const deleteBudget = async (id, userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/budgets/${id}?userEmail=${encodeURIComponent(
        userEmail
      )}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to delete this budget. Please try again."
        )
      );
    }

    return response.text();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to delete this budget. Please try again."
      )
    );
  }
};


// ===============================
// MONTHLY REPORT
// ===============================
export const getMonthlyReport = async (yearMonth, userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reports/monthly?yearMonth=${yearMonth}&userEmail=${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to load the monthly report. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to load the monthly report. Please try again."
      )
    );
  }
};


// ===============================
// YEARLY REPORT
// ===============================
export const getYearlyReport = async (year, userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reports/yearly?year=${year}&userEmail=${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to load the yearly report. Please try again."
        )
      );
    }

    return response.json();

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to load the yearly report. Please try again."
      )
    );
  }
};
// ===============================
// REGISTER - SEND OTP
// ===============================
export const registerUser = async (
  email,
  password,
  firstName,
  lastName
) => {
  try {
    const params = new URLSearchParams({
      email,
      password,
      firstName,
      lastName
    });

    const response = await fetch(
      `${API_BASE_URL}/auth/register?${params.toString()}`,
      {
        method: "POST"
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to start registration. Please try again."
        )
      );
    }

    return data;

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to send verification OTP. Please try again."
      )
    );
  }
};


// ===============================
// VERIFY REGISTRATION OTP
// ===============================
export const verifyRegistration = async (
  email,
  otp,
  password,
  firstName,
  lastName
) => {
  try {
    const params = new URLSearchParams({
      email,
      otp,
      password,
      firstName,
      lastName
    });

    const response = await fetch(
      `${API_BASE_URL}/auth/verify-registration?${params.toString()}`,
      {
        method: "POST"
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Invalid or expired OTP. Please try again."
        )
      );
    }

    return data;

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to verify OTP. Please try again."
      )
    );
  }
};


// ===============================
// LOGIN
// ===============================
export const loginUser = async (
  email,
  password
) => {
  try {
    const params = new URLSearchParams({
      email,
      password
    });

    const response = await fetch(
      `${API_BASE_URL}/auth/login?${params.toString()}`,
      {
        method: "POST"
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to sign you in. Please check your details and try again."
        )
      );
    }

    return data;

  } catch (error) {

    if (
      error.message ===
      "No account found with this email. Please register first."
    ) {
      throw error;
    }

    if (
      error.message ===
      "Incorrect password. Please try again."
    ) {
      throw error;
    }

    if (
      error.message ===
      "An account with this email already exists. Please log in instead."
    ) {
      throw error;
    }

    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to sign you in. Please try again."
      )
    );
  }
};


// ===============================
// FORGOT PASSWORD - SEND OTP
// ===============================
export const forgotPassword = async (email) => {
  try {
    const params = new URLSearchParams({
      email
    });

    const response = await fetch(
      `${API_BASE_URL}/auth/forgot-password?${params.toString()}`,
      {
        method: "POST"
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to send password reset OTP. Please try again."
        )
      );
    }

    return data;

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to send password reset OTP. Please try again."
      )
    );
  }
};


// ===============================
// RESET PASSWORD WITH OTP
// ===============================
export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  try {
    const params = new URLSearchParams({
      email,
      otp,
      newPassword
    });

    const response = await fetch(
      `${API_BASE_URL}/auth/reset-password?${params.toString()}`,
      {
        method: "POST"
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getFriendlyError(
          data.error || data.message,
          "Unable to reset your password. Please try again."
        )
      );
    }

    return data;

  } catch (error) {
    throw new Error(
      getFriendlyError(
        error.message,
        "Unable to reset your password. Please try again."
      )
    );
  }
};