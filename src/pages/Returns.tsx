
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReturnReport from "@/components/reports/ReturnReport";
import ReturnForm from "@/components/returns/ReturnForm";
import EmptyState from "@/components/returns/EmptyState";

const Returns = () => {
  const { pelakuUsaha } = useAuth();

  if (!pelakuUsaha) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="create">
        <TabsList className="mb-4">
          <TabsTrigger value="create">Buat Retur</TabsTrigger>
          <TabsTrigger value="history">Riwayat Retur</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Buat Retur Produk</CardTitle>
              <CardDescription>
                Isi form di bawah ini untuk mencatat retur produk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnForm pelakuUsahaId={pelakuUsaha.pelaku_usaha_id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <ReturnReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Returns;
