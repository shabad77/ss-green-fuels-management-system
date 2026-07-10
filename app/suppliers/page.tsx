import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function SuppliersPage() {
  return (
    <MainLayout>

      <h1 className="text-4xl font-bold mb-6">
        Supplier Master
      </h1>

      <Card title="Add Supplier">

        <div className="grid grid-cols-2 gap-5">

          <Input placeholder="Supplier Name" />

          <Input placeholder="Village / City" />

          <Input placeholder="Mobile Number" />

          <Input placeholder="GST Number (Optional)" />

        </div>

        <div className="mt-6">

          <Button>
            Save Supplier
          </Button>

        </div>

      </Card>

    </MainLayout>
  );
}