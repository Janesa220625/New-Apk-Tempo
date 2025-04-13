import { useState } from "react";
import * as XLSX from "xlsx";
import { Product } from "@/types/schema";

type ValidationResult = {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  validatedEntry?: any;
};

export const useExcelImport = (products: Product[]) => {
  const [bulkEntries, setBulkEntries] = useState<Array<any>>([]);
  const [bulkInputError, setBulkInputError] = useState<string | null>(null);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [previewData, setPreviewData] = useState<Array<any>>([]);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Generate Excel template for download
  const generateExcelTemplate = () => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Define the template headers and sample data
      const templateHeaders = [
        "Product ID",
        "Product SKU",
        "Product Name",
        "Boxes Received",
        "Supplier Name",
        "Description (Optional)",
      ];

      // Create sample data rows
      const sampleData = [];

      // Add sample data if products are available
      if (products.length > 0) {
        // Add up to 3 sample products
        const sampleProducts = products.slice(0, 3);

        sampleProducts.forEach((product) => {
          sampleData.push([
            product.id,
            product.sku,
            product.name,
            "5", // Sample boxes received
            "Supplier Name", // Sample supplier name
            "Optional description", // Sample description
          ]);
        });
      } else {
        // Add a generic sample if no products are available
        sampleData.push([
          "product-id-example",
          "SKU-123",
          "Product Name Example",
          "5",
          "Supplier Name Example",
          "Optional description",
        ]);
      }

      // Create a worksheet with headers and sample data
      const worksheet = XLSX.utils.aoa_to_sheet([
        templateHeaders,
        ...sampleData,
      ]);

      // Add column widths for better readability
      const colWidths = [
        { wch: 36 }, // Product ID
        { wch: 15 }, // Product SKU
        { wch: 30 }, // Product Name
        { wch: 15 }, // Boxes Received
        { wch: 20 }, // Supplier Name
        { wch: 30 }, // Description
      ];

      worksheet["!cols"] = colWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Box Stock Template");

      // Create a second sheet with product reference data
      const productHeaders = ["Product ID", "SKU", "Name", "Box Contents"];
      const productData = products.map((product) => [
        product.id,
        product.sku,
        product.name,
        product.box_contents.toString(),
      ]);

      const productSheet = XLSX.utils.aoa_to_sheet([
        productHeaders,
        ...productData,
      ]);

      // Add column widths for product sheet
      const productColWidths = [
        { wch: 36 }, // Product ID
        { wch: 15 }, // SKU
        { wch: 30 }, // Name
        { wch: 15 }, // Box Contents
      ];

      productSheet["!cols"] = productColWidths;

      // Add the product reference sheet to the workbook
      XLSX.utils.book_append_sheet(workbook, productSheet, "Product Reference");

      // Generate the Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "box_stock_import_template.xlsx";
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Excel template generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating Excel template:", error);
      setBulkInputError("Failed to generate Excel template. Please try again.");
    }
  };

  // Validate a single entry
  const validateEntry = (entry: any): ValidationResult => {
    const errors = [];
    const warnings = [];

    // Check required fields with more robust validation
    if (
      !entry.productId ||
      typeof entry.productId !== "string" ||
      entry.productId.trim() === ""
    ) {
      errors.push("Product ID is required and must be a valid string");
    }

    // Check if boxesReceived exists and is convertible to a number
    if (entry.boxesReceived === undefined || entry.boxesReceived === null) {
      errors.push("Boxes received is required");
    }

    // Check if supplierName exists and is a non-empty string
    if (
      !entry.supplierName ||
      typeof entry.supplierName !== "string" ||
      entry.supplierName.trim() === ""
    ) {
      errors.push("Supplier name is required and cannot be empty");
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Validate product ID exists in our product list
    const product = products.find((p) => p.id === entry.productId);
    if (!product) {
      errors.push(
        `Product with ID ${entry.productId} not found in the database`,
      );
      return { valid: false, errors };
    }

    // Validate boxes received is a positive number with better parsing
    let boxCount: number;
    try {
      boxCount =
        typeof entry.boxesReceived === "number"
          ? entry.boxesReceived
          : parseInt(entry.boxesReceived);

      if (isNaN(boxCount)) {
        errors.push("Boxes received must be a valid number");
        return { valid: false, errors };
      }
    } catch (e) {
      errors.push("Boxes received must be a valid number");
      return { valid: false, errors };
    }

    if (boxCount <= 0) {
      errors.push("Boxes received must be a positive number");
      return { valid: false, errors };
    }

    // Enhanced validation checks
    if (boxCount > 1000) {
      warnings.push(
        `Unusually large quantity (${boxCount} boxes). Please verify.`,
      );
    }

    // Check for reasonable box contents
    if (product.box_contents <= 0) {
      warnings.push(
        `Product ${product.name} has ${product.box_contents} items per box. Please verify product configuration.`,
      );
    }

    // Create a validated entry with proper types and sanitized data
    const validatedEntry = {
      productId: entry.productId,
      boxesReceived: boxCount,
      supplierName: (entry.supplierName || "").trim(),
      description: entry.description ? entry.description.trim() : "",
      productName: product.name,
      sku: product.sku,
      boxContents: product.box_contents || 0,
      totalUnits: boxCount * (product.box_contents || 0),
    };

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      validatedEntry,
    };
  };

  // Process the uploaded Excel file
  const processExcelFile = async (file: File) => {
    setIsProcessingExcel(true);
    setBulkInputError(null);
    setPreviewWarnings([]);

    try {
      // Validate file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "xlsx" && fileExtension !== "xls") {
        setBulkInputError(
          "Invalid file format. Please upload an Excel file (.xlsx or .xls).",
        );
        setIsProcessingExcel(false);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setBulkInputError("File is too large. Maximum file size is 10MB.");
        setIsProcessingExcel(false);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("Failed to read file");
          }

          const data = new Uint8Array(e.target.result as ArrayBuffer);
          let workbook;
          try {
            workbook = XLSX.read(data, { type: "array" });
          } catch (xlsxError) {
            console.error("XLSX parsing error:", xlsxError);
            setBulkInputError(
              "Could not parse the Excel file. The file might be corrupted or in an unsupported format.",
            );
            setIsProcessingExcel(false);
            return;
          }

          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            setBulkInputError("Excel file contains no sheets.");
            setIsProcessingExcel(false);
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as any[][];

          if (jsonData.length < 2) {
            setBulkInputError(
              "The Excel file does not contain enough data. Please use the template format.",
            );
            setIsProcessingExcel(false);
            return;
          }

          // Extract headers and validate them
          const headers = jsonData[0] as string[];
          const requiredHeaders = [
            "Product ID",
            "Boxes Received",
            "Supplier Name",
          ];

          const missingHeaders = requiredHeaders.filter(
            (header) =>
              !headers.some((h) => h?.toLowerCase() === header.toLowerCase()),
          );

          if (missingHeaders.length > 0) {
            setBulkInputError(
              `Missing required columns: ${missingHeaders.join(", ")}. Please use the template format.`,
            );
            setIsProcessingExcel(false);
            return;
          }

          // Map column indices
          const columnMap = {
            productId: headers.findIndex(
              (h) => h?.toLowerCase() === "product id".toLowerCase(),
            ),
            productSku: headers.findIndex(
              (h) => h?.toLowerCase() === "product sku".toLowerCase(),
            ),
            productName: headers.findIndex(
              (h) => h?.toLowerCase() === "product name".toLowerCase(),
            ),
            boxesReceived: headers.findIndex(
              (h) => h?.toLowerCase() === "boxes received".toLowerCase(),
            ),
            supplierName: headers.findIndex(
              (h) => h?.toLowerCase() === "supplier name".toLowerCase(),
            ),
            description: headers.findIndex(
              (h) =>
                h?.toLowerCase() === "description (optional)".toLowerCase(),
            ),
          };

          // Validate column indices
          if (
            columnMap.productId === -1 ||
            columnMap.boxesReceived === -1 ||
            columnMap.supplierName === -1
          ) {
            setBulkInputError(
              "Required columns not found in the expected format. Please use the template format.",
            );
            setIsProcessingExcel(false);
            return;
          }

          // Process data rows
          const dataRows = jsonData
            .slice(1)
            .filter((row) => row && row.length > 0);

          if (dataRows.length === 0) {
            setBulkInputError(
              "The Excel file contains headers but no data rows.",
            );
            setIsProcessingExcel(false);
            return;
          }

          const entries = [];
          const warnings = [];

          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];

            // Create entry object
            const entry = {
              productId: row[columnMap.productId]?.toString() || "",
              boxesReceived: parseInt(row[columnMap.boxesReceived]) || 0,
              supplierName: row[columnMap.supplierName]?.toString() || "",
              description: row[columnMap.description]?.toString() || "",
            };

            // Validate the entry
            const validation = validateEntry(entry);

            if (validation.valid && validation.validatedEntry) {
              entries.push(validation.validatedEntry);

              if (validation.warnings) {
                validation.warnings.forEach((warning) => {
                  warnings.push(`Row ${i + 2}: ${warning}`);
                });
              }
            } else if (validation.errors) {
              warnings.push(`Row ${i + 2}: ${validation.errors.join(", ")}`);
            }
          }

          if (entries.length === 0) {
            setBulkInputError(
              "No valid entries found in the Excel file. Please check the data format and ensure all required fields are filled correctly.",
            );
            setIsProcessingExcel(false);
            return;
          }

          // Set the validated entries
          setBulkEntries(entries);

          // Set preview data (first 10 entries)
          const previewItems = entries.slice(0, 10).map((entry, index) => ({
            ...entry,
            index: index + 1,
            hasWarnings: false,
          }));

          setPreviewData(previewItems);

          // Set warnings if any
          if (warnings.length > 0) {
            setPreviewWarnings(warnings.slice(0, 5));
            if (warnings.length > 5) {
              setPreviewWarnings((prev) => [
                ...prev,
                `...and ${warnings.length - 5} more warnings`,
              ]);
            }
          }

          // Show preview mode
          setIsPreviewMode(true);
        } catch (error: any) {
          console.error("Error processing Excel file:", error);
          setBulkInputError(
            `Failed to process the Excel file: ${error.message || "Unknown error"}. Please make sure it's a valid Excel file.`,
          );
        } finally {
          setIsProcessingExcel(false);
        }
      };

      reader.onerror = (event) => {
        console.error("FileReader error:", event);
        setBulkInputError(
          "Error reading the file. Please try again with a different file.",
        );
        setIsProcessingExcel(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("Error processing Excel file:", error);
      setBulkInputError(
        `An unexpected error occurred while processing the file: ${error.message || "Unknown error"}`,
      );
      setIsProcessingExcel(false);
    }
  };

  // Handle Excel file upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setExcelFile(files[0]);
      setBulkInputError(null);
      // Clear any previous validation results
      setBulkEntries([]);
      setPreviewData([]);
      setPreviewWarnings([]);

      // Process the Excel file
      processExcelFile(files[0]);
    }
  };

  // Reset the Excel import state
  const resetExcelImport = () => {
    setBulkEntries([]);
    setBulkInputError(null);
    setPreviewData([]);
    setPreviewWarnings([]);
    setIsPreviewMode(false);
    setExcelFile(null);
    setIsProcessingExcel(false);
  };

  return {
    bulkEntries,
    bulkInputError,
    isProcessingExcel,
    previewData,
    previewWarnings,
    isPreviewMode,
    excelFile,
    generateExcelTemplate,
    handleExcelUpload,
    processExcelFile,
    validateEntry,
    resetExcelImport,
    setIsPreviewMode,
    setBulkInputError,
    setBulkEntries,
  };
};
