import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";

export default function VehiclesPage() {
  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-6">
        Vehicle Master
      </h1>

      <Card title="Add Vehicle">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <TextInput
            label="Vehicle Number"
            placeholder="RJ03 GB 1234"
          />

          <TextInput
            label="Vehicle Owner"
            placeholder=" "
          />

          <TextInput
            label="Vehicle Type"
            placeholder="Truck / Tractor / Pickup"
          />

        </div>

        <div className="mt-6">
          <Button>
            Save Vehicle
          </Button>
        </div>

      </Card>

    </MainLayout>
  );
}