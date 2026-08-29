import { useEffect, useState } from "react";

const API_BASE_URL = "https://expense-tracker-b45q.onrender.com/api";

function CategoryPage({ userEmail }) {

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const [editingId, setEditingId] = useState(null);


  // ===============================
  // LOAD CATEGORIES
  // ===============================

  const loadCategories = async () => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/categories?userEmail=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data = await response.json();

      setCategories(data || []);

    } catch (error) {

      console.error(error);
      alert("Failed to load categories");

    }
  };


  useEffect(() => {
    loadCategories();
  }, []);


  // ===============================
  // FORM CHANGE
  // ===============================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  // ===============================
  // ADD / UPDATE
  // ===============================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter category name");
      return;
    }

    try {

      const url = editingId
        ? `${API_BASE_URL}/categories/${editingId}`
        : `${API_BASE_URL}/categories`;

      const response = await fetch(url, {

        method: editingId ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: form.name,
          description: form.description
        })

      });


      if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
          errorText || "Operation failed"
        );

      }


      alert(
        editingId
          ? "Category updated successfully"
          : "Category added successfully"
      );


      setForm({
        name: "",
        description: ""
      });

      setEditingId(null);

      loadCategories();

    } catch (error) {

      console.error(error);
      alert(error.message);

    }

  };


  // ===============================
  // EDIT
  // ===============================

  const handleEdit = (category) => {

    setEditingId(category.id);

    setForm({
      name: category.name || "",
      description: category.description || ""
    });

  };


  // ===============================
  // DELETE
  // ===============================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `${API_BASE_URL}/categories/${id}`,
        {
          method: "DELETE"
        }
      );


      if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
          errorText || "Failed to delete category"
        );

      }


      alert("Category deleted successfully");

      loadCategories();

    } catch (error) {

      console.error(error);
      alert(error.message);

    }

  };


  // ===============================
  // CANCEL EDIT
  // ===============================

  const handleCancel = () => {

    setEditingId(null);

    setForm({
      name: "",
      description: ""
    });

  };


  return (

    <div className="expense-page">

      <h1>
        {editingId
          ? "Edit Category"
          : "Add Category"}
      </h1>


      {/* ===============================
          CATEGORY FORM
      =============================== */}

      <form
        onSubmit={handleSubmit}
        className="expense-form"
      >

        <div>

          <label>
            Category Name *
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Example: Travel"
          />

        </div>


        <div>

          <label>
            Description
          </label>

          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Example: Travel expenses"
          />

        </div>


        <button type="submit">

          {editingId
            ? "Update Category"
            : "Add Category"}

        </button>


        {editingId && (

          <button
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>

        )}

      </form>


      {/* ===============================
          ALL CATEGORIES
      =============================== */}

      <h2>
        All Categories
      </h2>


      <div className="expense-table category-table">

        {/* TABLE HEADER */}

        <div className="category-row category-header">

          <span>
            Name
          </span>

          <span>
            Description
          </span>

          <span>
            Action
          </span>

        </div>


        {/* TABLE DATA */}

        {categories.length === 0 ? (

          <div className="category-row">

            <span>
              No categories found
            </span>

          </div>

        ) : (

          categories.map((category) => (

            <div
              className="category-row"
              key={category.id}
            >

              <span>
                {category.name}
              </span>


              <span>
                {category.description || "-"}
              </span>


              {/* ACTION BUTTONS */}

              <span className="action-buttons">

                <button
                  onClick={() =>
                    handleEdit(category)
                  }
                >
                  Edit
                </button>


                <button
                  onClick={() =>
                    handleDelete(category.id)
                  }
                >
                  Delete
                </button>

              </span>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default CategoryPage;