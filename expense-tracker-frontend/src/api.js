const API_BASE_URL = "https://expense-tracker-b45q.onrender.com/api";

// ===============================
// GET CATEGORIES
// ===============================
export const getCategories = async (userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/categories?userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};


// ===============================
// GET EXPENSES
// ===============================
export const getExpenses = async (userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/expenses?userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return response.json();
};


// ===============================
// GET BUDGETS
// ===============================
export const getBudgets = async (userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/budgets?userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch budgets");
  }

  return response.json();
};


// ===============================
// ADD EXPENSE
// ===============================
export const addExpense = async (expense, userEmail) => {
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
    throw new Error("Failed to add expense");
  }

  return response.json();
};


// ===============================
// UPDATE EXPENSE
// ===============================
export const updateExpense = async (id, expense, userEmail) => {
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
    throw new Error("Failed to update expense");
  }

  return response.json();
};


// ===============================
// DELETE EXPENSE
// ===============================
export const deleteExpense = async (id, userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/expenses/${id}?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }

  return response.text();
};


// ===============================
// ADD BUDGET
// ===============================
export const addBudget = async (budget, userEmail, categoryId) => {
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
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add budget");
  }

  return response.json();
};


// ===============================
// UPDATE BUDGET
// ===============================
export const updateBudget = async (
  id,
  budget,
  userEmail
) => {
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
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to update budget"
    );
  }

  return response.json();
};


// ===============================
// DELETE BUDGET
// ===============================
export const deleteBudget = async (id, userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/budgets/${id}?userEmail=${encodeURIComponent(
      userEmail
    )}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete budget");
  }

  return response.text();
};


// ===============================
// REPORTS
// ===============================
export const getMonthlyReport = async (yearMonth, userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/reports/monthly?yearMonth=${yearMonth}&userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monthly report");
  }

  return response.json();
};


export const getYearlyReport = async (year, userEmail) => {
  const response = await fetch(
    `${API_BASE_URL}/reports/yearly?year=${year}&userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch yearly report");
  }

  return response.json();
};

// ===============================
// REGISTER
// ===============================
export const registerUser = async (
  email,
  password,
  firstName,
  lastName
) => {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};


// ===============================
// LOGIN
// ===============================
export const loginUser = async (
  email,
  password
) => {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (
  email,
  newPassword
) => {

  const params = new URLSearchParams({
    email,
    newPassword
  });

  const response = await fetch(
    `${API_BASE_URL}/auth/reset-password?${params.toString()}`,
    {
      method: "POST"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Password reset failed"
    );
  }

  return data;
};
