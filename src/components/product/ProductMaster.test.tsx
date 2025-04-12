import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import ProductMaster from "./ProductMaster";
import { productService } from "@/services/productService";
import { Product } from "@/types/schema";

// Mock the productService
vi.mock("@/services/productService", () => ({
  productService: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

// Mock the toast component
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the Supabase auth helpers
vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: () => ({
    id: "mock-user-id",
    email: "test@example.com",
  }),
}));

// Mock the translation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("ProductMaster Component", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      sku: "TEST-001",
      name: "Test Product 1",
      price: 100000,
      box_contents: 12,
      category: "Boys Shoes",
      creator_id: "mock-user-id",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      sku: "TEST-002",
      name: "Test Product 2",
      price: 150000,
      box_contents: 24,
      category: "Girls Shoes",
      creator_id: "mock-user-id",
      created_at: "2023-01-02T00:00:00.000Z",
      updated_at: "2023-01-02T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Setup default mock implementation
    (productService.getProducts as any).mockResolvedValue(mockProducts);
    (productService.createProduct as any).mockResolvedValue(mockProducts[0]);
    (productService.updateProduct as any).mockResolvedValue({
      ...mockProducts[0],
      name: "Updated Product",
    });
    (productService.deleteProduct as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the product list correctly", async () => {
    render(<ProductMaster />);

    // Check if the component is loading initially
    expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();

    // Wait for the products to load
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Boys Shoes")).toBeInTheDocument();
    });
  });

  it("filters products by search query", async () => {
    render(<ProductMaster />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(
      /Search by SKU or product name.../i,
    );
    fireEvent.change(searchInput, { target: { value: "TEST-002" } });

    // Check if filtering works by looking specifically in the table rows
    await waitFor(() => {
      const tableRows = screen.getAllByRole("row").slice(1); // Skip header row
      const productCells = tableRows.map((row) => row.textContent);

      // Check that TEST-001 is not in any table row
      expect(productCells.some((cell) => cell?.includes("TEST-001"))).toBe(
        false,
      );

      // Check that TEST-002 is in a table row
      expect(productCells.some((cell) => cell?.includes("TEST-002"))).toBe(
        true,
      );
    });
  });

  it("filters products by category", async () => {
    render(<ProductMaster />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
      expect(screen.getByText("TEST-002")).toBeInTheDocument();
    });

    // Open category dropdown
    const categorySelect = screen.getByText("All Categories");
    fireEvent.click(categorySelect);

    // Select a category
    const girlsShoesOption = screen.getByText("Girls Shoes");
    fireEvent.click(girlsShoesOption);

    // Check if filtering works by looking specifically in the table rows
    await waitFor(() => {
      const tableRows = screen.getAllByRole("row").slice(1); // Skip header row
      const productCells = tableRows.map((row) => row.textContent);

      // Check that TEST-001 is not in any table row
      expect(productCells.some((cell) => cell?.includes("TEST-001"))).toBe(
        false,
      );

      // Check that TEST-002 is in a table row
      expect(productCells.some((cell) => cell?.includes("TEST-002"))).toBe(
        true,
      );
    });
  });

  it("opens the add product dialog and submits a new product", async () => {
    render(<ProductMaster />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Click add product button
    const addButton = screen.getByRole("button", {
      name: /product\.addProduct/i,
    });
    fireEvent.click(addButton);

    // Fill the form
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/fields.sku/i), {
      target: { value: "NEW-001" },
    });
    fireEvent.change(screen.getByLabelText(/fields.productName/i), {
      target: { value: "New Test Product" },
    });
    fireEvent.change(screen.getByLabelText(/fields.price/i), {
      target: { value: "200000" },
    });
    fireEvent.change(screen.getByLabelText(/fields.boxContents/i), {
      target: { value: "36" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { type: "submit" });
    fireEvent.click(submitButton);

    // Check if createProduct was called with correct data and user ID
    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalledWith(
        {
          sku: "NEW-001",
          name: "New Test Product",
          price: 200000,
          box_contents: 36,
          description: "",
          category: "Boys Shoes",
        },
        "mock-user-id",
      );
    });

    // Check if products are refreshed
    expect(productService.getProducts).toHaveBeenCalledTimes(2);
  });

  it("opens the edit product dialog and updates a product", async () => {
    render(<ProductMaster />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Find and click the edit button for the first product
    const editButtons = screen.getAllByRole("button", { name: "" });
    const editButton = editButtons.find((button) => {
      const svg = button.querySelector("svg");
      return svg && svg.classList.contains("lucide-edit");
    });

    if (editButton) {
      fireEvent.click(editButton);
    }

    // Wait for the edit dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Change the product name
    const nameInput = screen.getByDisplayValue("Test Product 1");
    fireEvent.change(nameInput, { target: { value: "Updated Product Name" } });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /common\.save/i });
    fireEvent.click(saveButton);

    // Check if updateProduct was called with correct data
    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          name: "Updated Product Name",
        }),
      );
    });

    // Check if products are refreshed
    expect(productService.getProducts).toHaveBeenCalledTimes(2);
  });

  it("opens the delete confirmation dialog and deletes a product", async () => {
    render(<ProductMaster />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Find and click the delete button for the first product
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const deleteButton = deleteButtons.find((button) => {
      const svg = button.querySelector("svg");
      return svg && svg.classList.contains("lucide-trash2");
    });

    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // Wait for the delete dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByRole("button", {
      name: /common\.delete/i,
    });
    fireEvent.click(confirmButton);

    // Check if deleteProduct was called with correct ID
    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalledWith("1");
    });

    // Check if products are refreshed
    expect(productService.getProducts).toHaveBeenCalledTimes(2);
  });

  it("handles API errors when fetching products", async () => {
    // Mock the getProducts to throw an error
    (productService.getProducts as any).mockRejectedValue(
      new Error("Failed to fetch products"),
    );

    render(<ProductMaster />);

    // Check if loading state is shown initially
    expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();

    // Check if error handling works
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalledTimes(1);
    });

    // Since we're mocking a rejected promise, the loading state should be removed
    await waitFor(() => {
      expect(
        screen.queryByText(/Loading products.../i),
      ).not.toBeInTheDocument();
    });

    // The table should show no products found message
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  it("handles API errors when creating a product", async () => {
    // Setup: First load products successfully
    render(<ProductMaster />);

    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Mock createProduct to throw an error for this test
    (productService.createProduct as any).mockRejectedValue(
      new Error("Failed to create product"),
    );

    // Open add dialog
    const addButton = screen.getByRole("button", {
      name: /product\.addProduct/i,
    });
    fireEvent.click(addButton);

    // Fill form and submit
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/fields.sku/i), {
      target: { value: "ERROR-001" },
    });
    fireEvent.change(screen.getByLabelText(/fields.productName/i), {
      target: { value: "Error Test" },
    });
    fireEvent.change(screen.getByLabelText(/fields.price/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/fields.boxContents/i), {
      target: { value: "10" },
    });

    const submitButton = screen.getByRole("button", { type: "submit" });
    fireEvent.click(submitButton);

    // Check if error handling works
    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalled();
    });

    // Verify the dialog remains open when there's an error
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify the submit button is re-enabled after error
    await waitFor(() => {
      const updatedSubmitButton = screen.getByRole("button", {
        type: "submit",
      });
      expect(updatedSubmitButton).not.toBeDisabled();
    });
  });

  it("handles API errors when updating a product", async () => {
    // Setup: First load products successfully
    render(<ProductMaster />);

    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Mock updateProduct to throw an error for this test
    (productService.updateProduct as any).mockRejectedValue(
      new Error("Failed to update product"),
    );

    // Find and click the edit button for the first product
    const editButtons = screen.getAllByRole("button", { name: "" });
    const editButton = editButtons.find((button) => {
      const svg = button.querySelector("svg");
      return svg && svg.classList.contains("lucide-edit");
    });

    if (editButton) {
      fireEvent.click(editButton);
    }

    // Wait for the edit dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Change the product name
    const nameInput = screen.getByDisplayValue("Test Product 1");
    fireEvent.change(nameInput, { target: { value: "Updated Product Name" } });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /common\.save/i });
    fireEvent.click(saveButton);

    // Check if updateProduct was called
    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalled();
    });

    // Verify the dialog remains open when there's an error
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify the save button is re-enabled after error
    await waitFor(() => {
      const updatedSaveButton = screen.getByRole("button", {
        name: /common\.save/i,
      });
      expect(updatedSaveButton).not.toBeDisabled();
    });
  });

  it("handles API errors when deleting a product", async () => {
    // Setup: First load products successfully
    render(<ProductMaster />);

    await waitFor(() => {
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });

    // Mock deleteProduct to throw an error for this test
    (productService.deleteProduct as any).mockRejectedValue(
      new Error("Failed to delete product"),
    );

    // Find and click the delete button for the first product
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const deleteButton = deleteButtons.find((button) => {
      const svg = button.querySelector("svg");
      return svg && svg.classList.contains("lucide-trash2");
    });

    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // Wait for the delete dialog to open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByRole("button", {
      name: /common\.delete/i,
    });
    fireEvent.click(confirmButton);

    // Check if deleteProduct was called
    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalled();
    });

    // Verify the dialog remains open when there's an error
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify the delete button is re-enabled after error
    await waitFor(() => {
      const updatedDeleteButton = screen.getByRole("button", {
        name: /common\.delete/i,
      });
      expect(updatedDeleteButton).not.toBeDisabled();
    });
  });
});
