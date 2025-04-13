import React, { useState } from "react";
import { Eye, Trash2, User, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { IncomingBoxStock, Product } from "@/types/schema";

interface IncomingBoxStockTableProps {
  boxStocks: IncomingBoxStock[];
  products: Product[];
  onViewBoxStock: (boxStock: IncomingBoxStock) => void;
  onDeleteBoxStock: (boxStock: IncomingBoxStock) => void;
}

type SortField =
  | "incoming_date"
  | "sku"
  | "creator_id"
  | "supplier_name"
  | null;
type SortDirection = "asc" | "desc";

const IncomingBoxStockTable: React.FC<IncomingBoxStockTableProps> = ({
  boxStocks,
  products,
  onViewBoxStock,
  onDeleteBoxStock,
}) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const getProductName = (productId: string): string => {
    if (!productId) {
      console.log("DEBUG - Table: productId is empty or null");
      return "Unknown Product (No ID)";
    }
    console.log("DEBUG - Table: Looking for product with ID:", productId);
    console.log("DEBUG - Table: Available products:", products);
    const product = products.find((p) => p.id === productId);
    console.log("DEBUG - Table: Product found:", product);
    return product ? product.name : `Unknown Product (ID: ${productId})`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedBoxStocks = () => {
    if (!sortField) return boxStocks;

    return [...boxStocks].sort((a, b) => {
      let valueA: string | number | Date;
      let valueB: string | number | Date;

      switch (sortField) {
        case "incoming_date":
          valueA = new Date(a.incoming_date || "");
          valueB = new Date(b.incoming_date || "");
          break;
        case "sku":
          valueA = (a.sku || "").toLowerCase();
          valueB = (b.sku || "").toLowerCase();
          break;
        case "creator_id":
          valueA = a.creator_id || "";
          valueB = b.creator_id || "";
          break;
        case "supplier_name":
          valueA = (a.supplier_name || "").toLowerCase();
          valueB = (b.supplier_name || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  const sortedBoxStocks = getSortedBoxStocks();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("incoming_date")}
            >
              Incoming Date {renderSortIcon("incoming_date")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("sku")}
            >
              SKU {renderSortIcon("sku")}
            </TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("supplier_name")}
            >
              Supplier {renderSortIcon("supplier_name")}
            </TableHead>
            <TableHead className="text-right">Boxes Received</TableHead>
            <TableHead className="text-right">Total Units</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("creator_id")}
            >
              Created By {renderSortIcon("creator_id")}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBoxStocks.length > 0 ? (
            sortedBoxStocks.map((boxStock) => (
              <TableRow key={boxStock.id}>
                <TableCell>{formatDate(boxStock.incoming_date)}</TableCell>
                <TableCell className="font-medium">
                  {boxStock.sku || "N/A"}
                </TableCell>
                <TableCell>
                  {(() => {
                    console.log(
                      "DEBUG - Table Cell: Rendering product_id:",
                      boxStock.product_id,
                    );
                    return boxStock.product_id
                      ? getProductName(boxStock.product_id)
                      : "Unknown Product";
                  })()}
                </TableCell>
                <TableCell>{boxStock.supplier_name || "N/A"}</TableCell>
                <TableCell className="text-right">
                  {boxStock.boxes_received} boxes
                </TableCell>
                <TableCell className="text-right">
                  {boxStock.total_units} pairs
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-xs">
                      {boxStock.creator_id
                        ? boxStock.creator_id.substring(0, 8) + "..."
                        : "System"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewBoxStock(boxStock)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteBoxStock(boxStock)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No incoming box stock records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IncomingBoxStockTable;
