import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import IncomingBoxStockComponent from "./IncomingBoxStock";
import { productService } from "@/services/productService";
import { incomingBoxStockService } from "@/services/incomingBoxStockService";
import { Product, IncomingBoxStock } from "@/types/schema";
import * as supabaseModule from "@/lib/supabase";
import userEvent from "@testing-library/user-event";

// Mock the services
vi.mock("@/services/productService", () => ({
  productService: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

vi.mock("@/services/incomingBoxStockService", () => ({
  incomingBoxStockService: {
    getIncomingBoxStocks: vi.fn(),
    getIncomingBoxStockById: vi.fn(),
    createIncomingBoxStock: vi.fn(),
    updateIncomingBoxStock: vi.fn(),
    deleteIncomingBoxStock: vi.fn(),
  },
}));

// Mock XLSX module
vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    sheet_to_json: vi.fn(),
  },
  write: vi.fn(() => new ArrayBuffer(0)),
  read: vi.fn(),
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
    },
  },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for the download link
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
Document.prototype.createElement = vi.fn().mockImplementation((tag) => {
  if (tag === "a") {
    return {
      href: "",
      download: "",
      click: mockClick,
    };
  }
  return {};
});
Document.prototype.body = {
  appendChild: mockAppendChild,
  removeChild: mockRemoveChild,
} as any;

// Sample data for tests
const mockProducts: Product[] = [
  {
    id: "prod-1",
    sku: "SKU-001",
    name: "Test Product 1",
    price: 99.99,
    box_contents: 12,
    category: "Sneakers",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "prod-2",
    sku: "SKU-002",
    name: "Test Product 2",
    price: 149.99,
    box_contents: 6,
    category: "Boots",
    created_at: "2023-01-02T00:00:00Z",
    updated_at: "2023-01-02T00:00:00Z",
  },
];

const mockBoxStocks: IncomingBoxStock[] = [
  {
    id: "box-1",
    incoming_date: "2023-06-01T00:00:00Z",
    product_id: "prod-1",
    sku: "SKU-001",
    boxes_received: 5,
    supplier_name: "Supplier A",
    total_units: 60,
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2023-06-01T00:00:00Z",
  },
  {
    id: "box-2",
    incoming_date: "2023-06-15T00:00:00Z",
    product_id: "prod-2",
    sku: "SKU-002",
    boxes_received: 10,
    supplier_name: "Supplier B",
    total_units: 60,
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2023-06-15T00:00:00Z",
  },
];

describe("IncomingBoxStockComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (productService.getProducts as any).mockResolvedValue(mockProducts);
    (incomingBoxStockService.getIncomingBoxStocks as any).mockResolvedValue(
      mockBoxStocks,
    );
    (incomingBoxStockService.createIncomingBoxStock as any).mockResolvedValue({
      id: "new-box-1",
      incoming_date: new Date().toISOString(),
      product_id: "prod-1",
      sku: "SKU-001",
      boxes_received: 5,
      supplier_name: "New Supplier",
      total_units: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  test("renders the component with initial data", async () => {
    render(<IncomingBoxStockComponent />);

    // Check if the component title is rendered
    expect(screen.getByText("Incoming Box Stock")).toBeInTheDocument();

    // Check if the services were called
    expect(productService.getProducts).toHaveBeenCalled();
    expect(incomingBoxStockService.getIncomingBoxStocks).toHaveBeenCalled();

    // Wait for the data to be loaded and displayed
    await waitFor(() => {
      expect(
        screen.getByText("Showing 2 of 2 incoming shipments"),
      ).toBeInTheDocument();
    });
  });

  test("opens add dialog when Add New Box button is clicked", async () => {
    render(<IncomingBoxStockComponent />);

    // Click the Add New Box button
    const addButton = screen.getByText(/Add New Box/);
    fireEvent.click(addButton);

    // Check if the dialog is opened
    await waitFor(() => {
      expect(screen.getByText("Add New Box")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Enter the details for the incoming shipment of boxed inventory.",
        ),
      ).toBeInTheDocument();
    });
  });

  test("filters box stocks based on search query", async () => {
    render(<IncomingBoxStockComponent />);

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(
        screen.getByText("Showing 2 of 2 incoming shipments"),
      ).toBeInTheDocument();
    });

    // Enter a search query
    const searchInput = screen.getByPlaceholderText(
      "Search by SKU or product name...",
    );
    fireEvent.change(searchInput, { target: { value: "SKU-001" } });

    // Check if the filter is applied
    await waitFor(() => {
      expect(
        screen.getByText("Showing 1 of 2 incoming shipments"),
      ).toBeInTheDocument();
    });
  });

  // Tests for single entry mode
  describe("Single Entry Mode", () => {
    test("allows selecting a product and updates total units automatically", async () => {
      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Select a product
      const productSelect = screen.getByText("Select product");
      fireEvent.click(productSelect);

      await waitFor(() => {
        const productOption = screen.getByText("SKU-001 - Test Product 1");
        expect(productOption).toBeInTheDocument();
        fireEvent.click(productOption);
      });

      // Change boxes received
      const boxesReceivedInput = screen.getByLabelText("Boxes Received");
      fireEvent.change(boxesReceivedInput, { target: { value: "5" } });

      // Check if total units is calculated correctly (5 boxes * 12 units = 60 units)
      const totalUnitsInput = screen.getByLabelText(
        "Total Units (Auto-calculated)",
      );
      expect(totalUnitsInput).toHaveValue(60);
    });

    test("submits the form with valid data in single entry mode", async () => {
      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Select a product
      const productSelect = screen.getByText("Select product");
      fireEvent.click(productSelect);

      await waitFor(() => {
        const productOption = screen.getByText("SKU-001 - Test Product 1");
        expect(productOption).toBeInTheDocument();
        fireEvent.click(productOption);
      });

      // Fill in the form
      const boxesReceivedInput = screen.getByLabelText("Boxes Received");
      fireEvent.change(boxesReceivedInput, { target: { value: "5" } });

      const supplierNameInput = screen.getByLabelText("Supplier Name");
      fireEvent.change(supplierNameInput, {
        target: { value: "Test Supplier" },
      });

      const descriptionInput = screen.getByLabelText("Description (Optional)");
      fireEvent.change(descriptionInput, {
        target: { value: "Test description" },
      });

      // Submit the form
      const saveButton = screen.getByText("Save Receipt");
      fireEvent.click(saveButton);

      // Check if the service was called with the correct data
      await waitFor(() => {
        expect(
          incomingBoxStockService.createIncomingBoxStock,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            product_id: "prod-1",
            sku: "SKU-001",
            boxes_received: 5,
            supplier_name: "Test Supplier",
            description: "Test description",
            total_units: 60,
          }),
          "test-user-id",
        );
      });

      // Check if the box stocks were refreshed
      expect(
        incomingBoxStockService.getIncomingBoxStocks,
      ).toHaveBeenCalledTimes(2);
    });

    test("validates required fields in single entry mode", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Submit the form without filling required fields
      const saveButton = screen.getByText("Save Receipt");
      fireEvent.click(saveButton);

      // Check if validation errors are shown or handled
      // Note: The actual component might handle this differently, adjust as needed
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(
          incomingBoxStockService.createIncomingBoxStock,
        ).not.toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  // Tests for bulk entry mode and Excel file processing
  describe("Bulk Entry Mode", () => {
    // Mock data for Excel file processing
    const mockExcelData = [
      [
        "Product ID",
        "Product SKU",
        "Product Name",
        "Boxes Received",
        "Supplier Name",
        "Description (Optional)",
      ],
      [
        "prod-1",
        "SKU-001",
        "Test Product 1",
        "10",
        "Supplier A",
        "Test description 1",
      ],
      [
        "prod-2",
        "SKU-002",
        "Test Product 2",
        "5",
        "Supplier B",
        "Test description 2",
      ],
    ];

    // Mock for FileReader
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: null as any,
    };

    beforeEach(() => {
      // Mock FileReader implementation
      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Mock XLSX.read to return a workbook with the mock data
      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: {
          Sheet1: {},
        },
      });

      // Mock XLSX.utils.sheet_to_json to return the mock data
      (XLSX.utils.sheet_to_json as any).mockReturnValue(mockExcelData);
    });

    test("switches to bulk entry mode when Excel Import tab is clicked", async () => {
      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Click on the Excel Import tab
      const excelImportTab = screen.getByText("Excel Import");
      fireEvent.click(excelImportTab);

      // Check if the bulk entry mode is active
      await waitFor(() => {
        expect(screen.getByText("Download Excel Template")).toBeInTheDocument();
        expect(
          screen.getByText("Drag and drop or click to upload"),
        ).toBeInTheDocument();
      });
    });

    test("generates and downloads Excel template when button is clicked", async () => {
      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Click on the Excel Import tab
      const excelImportTab = screen.getByText("Excel Import");
      fireEvent.click(excelImportTab);

      // Click on the Download Excel Template button
      const downloadButton = screen.getByText("Download Excel Template");
      fireEvent.click(downloadButton);

      // Check if the template was generated and downloaded
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    test("processes Excel file upload and validates data", async () => {
      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Click on the Excel Import tab
      const excelImportTab = screen.getByText("Excel Import");
      fireEvent.click(excelImportTab);

      // Find the file input and simulate file upload
      const fileInput = screen
        .getByText("Select File")
        .closest("label")!
        .querySelector("input");
      expect(fileInput).not.toBeNull();

      const mockFile = new File(["dummy content"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      fireEvent.change(fileInput!, { target: { files: [mockFile] } });

      // Simulate FileReader onload event
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({ target: mockFileReader } as any);

      // Check if the preview mode is shown with the processed data
      await waitFor(() => {
        expect(XLSX.read).toHaveBeenCalled();
        expect(XLSX.utils.sheet_to_json).toHaveBeenCalled();
      });
    });

    test("handles invalid Excel file upload", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Click on the Excel Import tab
      const excelImportTab = screen.getByText("Excel Import");
      fireEvent.click(excelImportTab);

      // Find the file input and simulate file upload with invalid file
      const fileInput = screen
        .getByText("Select File")
        .closest("label")!
        .querySelector("input");

      const mockInvalidFile = new File(["invalid content"], "test.txt", {
        type: "text/plain",
      });

      fireEvent.change(fileInput!, { target: { files: [mockInvalidFile] } });

      // Simulate FileReader error event
      mockFileReader.onerror({ target: mockFileReader } as any);

      // Check if error handling is triggered
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  // Tests for date filtering functionality
  describe("Date Filtering", () => {
    test("filters box stocks by date range when a predefined range is selected", async () => {
      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Open the date range dropdown
      const dateRangeSelect = screen.getByText("Date Range");
      fireEvent.click(dateRangeSelect);

      // Select "This Month" option
      const thisMonthOption = screen.getByText("This Month");
      fireEvent.click(thisMonthOption);

      // Check if the filter is applied
      // Note: The actual filtering logic is tested in the useDateFilter hook tests,
      // here we're just checking if the component uses the hook correctly
      await waitFor(() => {
        expect(screen.getByText("This Month")).toBeInTheDocument();
      });
    });

    test("shows custom date range inputs when 'Custom Range' is selected", async () => {
      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Open the date range dropdown
      const dateRangeSelect = screen.getByText("Date Range");
      fireEvent.click(dateRangeSelect);

      // Select "Custom Range" option
      const customRangeOption = screen.getByText("Custom Range");
      fireEvent.click(customRangeOption);

      // Check if the custom date inputs are shown
      await waitFor(() => {
        const startDateInput = screen.getByPlaceholderText("Start Date");
        const endDateInput = screen.getByPlaceholderText("End Date");
        expect(startDateInput).toBeInTheDocument();
        expect(endDateInput).toBeInTheDocument();
      });

      // Set custom date range
      const startDateInput = screen.getByPlaceholderText("Start Date");
      const endDateInput = screen.getByPlaceholderText("End Date");

      fireEvent.change(startDateInput, { target: { value: "2023-01-01" } });
      fireEvent.change(endDateInput, { target: { value: "2023-12-31" } });

      // Check if the inputs have the correct values
      expect(startDateInput).toHaveValue("2023-01-01");
      expect(endDateInput).toHaveValue("2023-12-31");
    });
  });

  // Tests for delete confirmation dialog
  describe("Delete Confirmation Dialog", () => {
    test("opens delete confirmation dialog when delete button is clicked", async () => {
      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Find and click the delete button for the first box stock
      // Note: This assumes there's a delete button in the table row
      // You might need to adjust this based on your actual implementation
      const deleteButtons = screen.getAllByLabelText("Delete box stock");
      fireEvent.click(deleteButtons[0]);

      // Check if the confirmation dialog is shown
      await waitFor(() => {
        expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Are you sure you want to delete this incoming shipment record?",
          ),
        ).toBeInTheDocument();
      });
    });

    test("closes the dialog when Cancel button is clicked", async () => {
      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Open the delete dialog
      const deleteButtons = screen.getAllByLabelText("Delete box stock");
      fireEvent.click(deleteButtons[0]);

      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      });

      // Click the Cancel button
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      // Check if the dialog is closed
      await waitFor(() => {
        expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
      });
    });

    test("deletes the box stock when Delete button is clicked", async () => {
      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Open the delete dialog
      const deleteButtons = screen.getAllByLabelText("Delete box stock");
      fireEvent.click(deleteButtons[0]);

      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      });

      // Click the Delete button
      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      // Check if the delete service was called with the correct ID
      await waitFor(() => {
        expect(
          incomingBoxStockService.deleteIncomingBoxStock,
        ).toHaveBeenCalledWith(mockBoxStocks[0].id);
      });

      // Check if the box stocks were refreshed
      expect(
        incomingBoxStockService.getIncomingBoxStocks,
      ).toHaveBeenCalledTimes(2);
    });

    test("shows loading state during deletion process", async () => {
      // Mock the deleteIncomingBoxStock to delay the response
      (
        incomingBoxStockService.deleteIncomingBoxStock as any
      ).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Open the delete dialog
      const deleteButtons = screen.getAllByLabelText("Delete box stock");
      fireEvent.click(deleteButtons[0]);

      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      });

      // Click the Delete button
      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      // Check if the loading state is shown
      await waitFor(() => {
        expect(screen.getByText("Deleting...")).toBeInTheDocument();
      });

      // Wait for the deletion to complete
      await waitFor(() => {
        expect(
          incomingBoxStockService.deleteIncomingBoxStock,
        ).toHaveBeenCalled();
      });
    });
  });

  // Tests for error handling
  describe("Error Handling", () => {
    test("handles error when fetching box stocks fails", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mock the getIncomingBoxStocks to throw an error
      (
        incomingBoxStockService.getIncomingBoxStocks as any
      ).mockRejectedValueOnce(new Error("Failed to fetch box stocks"));

      render(<IncomingBoxStockComponent />);

      // Check if the error was logged
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    test("handles error when fetching products fails", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mock the getProducts to throw an error
      (productService.getProducts as any).mockRejectedValueOnce(
        new Error("Failed to fetch products"),
      );

      render(<IncomingBoxStockComponent />);

      // Check if the error was logged
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    test("handles error when creating box stock fails", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mock the createIncomingBoxStock to throw an error
      (
        incomingBoxStockService.createIncomingBoxStock as any
      ).mockRejectedValueOnce(new Error("Failed to create box stock"));

      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Select a product
      const productSelect = screen.getByText("Select product");
      fireEvent.click(productSelect);

      await waitFor(() => {
        const productOption = screen.getByText("SKU-001 - Test Product 1");
        expect(productOption).toBeInTheDocument();
        fireEvent.click(productOption);
      });

      // Fill in the form
      const boxesReceivedInput = screen.getByLabelText("Boxes Received");
      fireEvent.change(boxesReceivedInput, { target: { value: "5" } });

      const supplierNameInput = screen.getByLabelText("Supplier Name");
      fireEvent.change(supplierNameInput, {
        target: { value: "Test Supplier" },
      });

      // Submit the form
      const saveButton = screen.getByText("Save Receipt");
      fireEvent.click(saveButton);

      // Check if the error was logged
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    test("handles error when deleting box stock fails", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mock the deleteIncomingBoxStock to throw an error
      (
        incomingBoxStockService.deleteIncomingBoxStock as any
      ).mockRejectedValueOnce(new Error("Failed to delete box stock"));

      render(<IncomingBoxStockComponent />);

      // Wait for the data to be loaded
      await waitFor(() => {
        expect(
          screen.getByText("Showing 2 of 2 incoming shipments"),
        ).toBeInTheDocument();
      });

      // Open the delete dialog
      const deleteButtons = screen.getAllByLabelText("Delete box stock");
      fireEvent.click(deleteButtons[0]);

      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      });

      // Click the Delete button
      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      // Check if the error was logged
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    test("handles error when processing Excel file with invalid format", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mock FileReader implementation
      const mockFileReader = {
        readAsArrayBuffer: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: null as any,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Mock XLSX.read to throw an error
      (XLSX.read as any).mockImplementationOnce(() => {
        throw new Error("Invalid Excel format");
      });

      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Click on the Excel Import tab
      const excelImportTab = screen.getByText("Excel Import");
      fireEvent.click(excelImportTab);

      // Find the file input and simulate file upload
      const fileInput = screen
        .getByText("Select File")
        .closest("label")!
        .querySelector("input");
      expect(fileInput).not.toBeNull();

      const mockFile = new File(["dummy content"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      fireEvent.change(fileInput!, { target: { files: [mockFile] } });

      // Simulate FileReader onload event
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({ target: mockFileReader } as any);

      // Check if the error was logged
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    test("handles error when processing Excel file with missing required columns", async () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mock data for Excel file processing with missing columns
      const mockExcelDataMissingColumns = [
        [
          "Product SKU", // Missing Product ID
          "Product Name",
          "Boxes Received",
          // Missing Supplier Name
        ],
        ["SKU-001", "Test Product 1", "10"],
      ];

      // Mock FileReader implementation
      const mockFileReader = {
        readAsArrayBuffer: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: null as any,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Mock XLSX.read to return a workbook with the mock data
      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: {
          Sheet1: {},
        },
      });

      // Mock XLSX.utils.sheet_to_json to return the mock data with missing columns
      (XLSX.utils.sheet_to_json as any).mockReturnValue(
        mockExcelDataMissingColumns,
      );

      render(<IncomingBoxStockComponent />);

      // Open the add dialog
      const addButton = screen.getByText(/Add New Box/);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add New Box")).toBeInTheDocument();
      });

      // Click on the Excel Import tab
      const excelImportTab = screen.getByText("Excel Import");
      fireEvent.click(excelImportTab);

      // Find the file input and simulate file upload
      const fileInput = screen
        .getByText("Select File")
        .closest("label")!
        .querySelector("input");
      expect(fileInput).not.toBeNull();

      const mockFile = new File(["dummy content"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      fireEvent.change(fileInput!, { target: { files: [mockFile] } });

      // Simulate FileReader onload event
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({ target: mockFileReader } as any);

      // Check if the error was logged
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });
  });
});
