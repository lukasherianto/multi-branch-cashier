
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TransferHeader = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Transfer Stok</CardTitle>
        <CardDescription>
          Pindahkan stok produk antar cabang dengan mudah
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Gunakan fitur ini untuk memindahkan stok antar cabang. Anda dapat melakukan transfer 
          dari Cabang Pusat ke Cabang lainnya atau sebaliknya. Pilih produk yang ingin ditransfer,
          tetapkan jumlah yang akan dipindahkan, dan konfirmasi transfer.
        </p>
      </CardContent>
    </Card>
  );
};

export default TransferHeader;
