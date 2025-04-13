import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SupplierNameProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const SupplierName: React.FC<SupplierNameProps> = ({
  value,
  onChange,
  required = false,
  label = "Supplier Name",
  placeholder = "Enter supplier name",
  className = "",
  id = "supplierName",
}) => {
  const [recentSuppliers, setRecentSuppliers] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recent suppliers from the database
  useEffect(() => {
    const fetchRecentSuppliers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("incoming_box_stock")
          .select("*")
          .not("supplier_name", "is", null)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Extract unique supplier names
        const uniqueSuppliers = Array.from(
          new Set(data.map((item) => item.supplier_name)),
        ).filter(Boolean) as string[];

        setRecentSuppliers(uniqueSuppliers);
      } catch (error) {
        console.error("Error fetching recent suppliers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSuppliers();
  }, []);

  // Filter suppliers based on input
  const filteredSuppliers = recentSuppliers.filter((supplier) =>
    supplier.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {isLoading && (
          <div className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        )}
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          required={required}
        />
        {showSuggestions && filteredSuppliers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredSuppliers.map((supplier, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(supplier);
                  setShowSuggestions(false);
                }}
              >
                {supplier}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierName;
