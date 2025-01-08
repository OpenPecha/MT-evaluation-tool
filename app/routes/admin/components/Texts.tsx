import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export default function Texts() {
  const fetcher = useFetcher();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        toast.error('Please select a JSON file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const formData = new FormData();
        formData.append("name", file.name);
        formData.append("data", reader.result as string);

        fetcher.submit(formData, { 
          method: "post",
          action: "/admin/texts"  
        });
      } catch (error) {
        toast.error("Failed to read the file");
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message || "File uploaded successfully");
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(fetcher.data.error || "Upload failed");
      }
      setIsLoading(false);
    }
  }, [fetcher.data]);

  return (
    <div className="mb-2 mt-4 flex flex-col gap-4 items-center px-4">
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 items-center w-full sm:justify-center">
          <Label htmlFor="text_file" className="text-sm font-medium text-gray-700">
            Upload JSON File
          </Label>
          <Input
            id="text_file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full sm:max-w-xs"
          />
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isLoading}
            className={`btn-sm rounded-md min-h-0 ${
              isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      
        {file && (
          <p className="text-sm text-gray-600 text-center mt-4">
            Selected file: {file.name}
          </p>
        )}
      </div>
    </div>
  );
}