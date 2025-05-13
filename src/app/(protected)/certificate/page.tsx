import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Table } from "@/src/components/multipage/Table";
import { useCertificates } from "@/src/hook/useCertificate";

export default function CertificatePage() {
    return (
        <div>
            <PageHeader title="Certificate" />
            <Table 
                data={[]}
                columns={[]}
                keyField="id"
            />
        </div>
    )
}