import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { productService } from "./productService";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/schema";

// Mock the Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  },
}));

describe("productService", () => {
  const mockProduct: Product = {
    id: "1",
    sku: "TEST-001",
    name: "Test Product",
    price: 100000,
    box_contents: 12,
    category: "Boys Shoes",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  };

  const mockProducts: Product[] = [mockProduct];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProducts", () => {
    it("should fetch all products successfully", async () => {
      // Mock the Supabase response
      (supabase.from as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.order as any).mockReturnThis();
      (supabase.order as any).mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const result = await productService.getProducts();

      expect(supabase.from).toHaveBeenCalledWith("products");
      expect(supabase.select).toHaveBeenCalledWith("*");
      expect(supabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockProducts);
    });

    it("should throw an error when fetching products fails", async () => {
      // Mock the Supabase error response
      (supabase.from as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.order as any).mockReturnThis();
      (supabase.order as any).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(productService.getProducts()).rejects.toThrow();
    });
  });

  describe("getProductById", () => {
    it("should fetch a product by ID successfully", async () => {
      // Mock the Supabase response
      (supabase.from as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.eq as any).mockReturnThis();
      (supabase.single as any).mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const result = await productService.getProductById("1");

      expect(supabase.from).toHaveBeenCalledWith("products");
      expect(supabase.select).toHaveBeenCalledWith("*");
      expect(supabase.eq).toHaveBeenCalledWith("id", "1");
      expect(supabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it("should throw an error when fetching a product by ID fails", async () => {
      // Mock the Supabase error response
      (supabase.from as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.eq as any).mockReturnThis();
      (supabase.single as any).mockResolvedValue({
        data: null,
        error: { message: "Product not found" },
      });

      await expect(productService.getProductById("999")).rejects.toThrow();
    });
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      const newProduct = {
        sku: "NEW-001",
        name: "New Product",
        price: 150000,
        box_contents: 24,
        category: "Girls Shoes",
        description: "New product description",
      };

      // Mock the Supabase response
      (supabase.from as any).mockReturnThis();
      (supabase.insert as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.single as any).mockResolvedValue({
        data: {
          ...newProduct,
          id: "2",
          created_at: "2023-01-02T00:00:00.000Z",
          updated_at: "2023-01-02T00:00:00.000Z",
        },
        error: null,
      });

      const result = await productService.createProduct(newProduct);

      expect(supabase.from).toHaveBeenCalledWith("products");
      expect(supabase.insert).toHaveBeenCalledWith(newProduct);
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.single).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(newProduct));
    });

    it("should throw an error when creating a product fails", async () => {
      // Mock the Supabase error response
      (supabase.from as any).mockReturnThis();
      (supabase.insert as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.single as any).mockResolvedValue({
        data: null,
        error: { message: "Duplicate SKU" },
      });

      await expect(
        productService.createProduct({
          sku: "DUP-001",
          name: "Duplicate Product",
          price: 100000,
          box_contents: 12,
          category: "Boys Shoes",
        }),
      ).rejects.toThrow();
    });
  });

  describe("updateProduct", () => {
    it("should update a product successfully", async () => {
      const updateData = {
        name: "Updated Product",
        price: 200000,
      };

      // Mock the Supabase response
      (supabase.from as any).mockReturnThis();
      (supabase.update as any).mockReturnThis();
      (supabase.eq as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.single as any).mockResolvedValue({
        data: {
          ...mockProduct,
          ...updateData,
          updated_at: "2023-01-03T00:00:00.000Z",
        },
        error: null,
      });

      const result = await productService.updateProduct("1", updateData);

      expect(supabase.from).toHaveBeenCalledWith("products");
      expect(supabase.update).toHaveBeenCalledWith(
        expect.objectContaining(updateData),
      );
      expect(supabase.eq).toHaveBeenCalledWith("id", "1");
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.single).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(updateData));
    });

    it("should throw an error when updating a product fails", async () => {
      // Mock the Supabase error response
      (supabase.from as any).mockReturnThis();
      (supabase.update as any).mockReturnThis();
      (supabase.eq as any).mockReturnThis();
      (supabase.select as any).mockReturnThis();
      (supabase.single as any).mockResolvedValue({
        data: null,
        error: { message: "Product not found" },
      });

      await expect(
        productService.updateProduct("999", { name: "Not Found" }),
      ).rejects.toThrow();
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product successfully", async () => {
      // Mock the Supabase response
      (supabase.from as any).mockReturnThis();
      (supabase.delete as any).mockReturnThis();
      (supabase.eq as any).mockResolvedValue({
        error: null,
      });

      await productService.deleteProduct("1");

      expect(supabase.from).toHaveBeenCalledWith("products");
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith("id", "1");
    });

    it("should throw an error when deleting a product fails", async () => {
      // Mock the Supabase error response
      (supabase.from as any).mockReturnThis();
      (supabase.delete as any).mockReturnThis();
      (supabase.eq as any).mockResolvedValue({
        error: { message: "Product not found" },
      });

      await expect(productService.deleteProduct("999")).rejects.toThrow();
    });
  });
});
