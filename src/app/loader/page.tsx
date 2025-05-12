// src/app/loader/page.tsx
import { CustomLoader, PageCustomLoader } from "@/src/components/ui/Loader";

export default function LoaderDebug() {
    return (
        <div className="container p-8 mx-auto space-y-12">
            <h1 className="text-2xl font-bold">Loader Showcase</h1>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Custom Loader - Small</h2>
                    <div className="p-8 border rounded-lg flex justify-center">
                        <CustomLoader size="sm" color="border-blue-500" />
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-4">Custom Loader - Medium</h2>
                    <div className="p-8 border rounded-lg flex justify-center">
                        <CustomLoader color="border-primary" />
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-4">Custom Loader - Large with Text</h2>
                    <div className="p-8 border rounded-lg flex justify-center">
                        <CustomLoader 
                            size="lg" 
                            color="border-green-500" 
                            text="Loading content..." 
                        />
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-4">Page Loader</h2>
                    <div className="p-8 border rounded-lg min-h-[300px] flex justify-center">
                        <PageCustomLoader text="Memuat halaman..." />
                    </div>
                </div>
            </div>
        </div>
    );
}