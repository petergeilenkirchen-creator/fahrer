import { getRides } from "@/lib/actions/rides"
import { getDrivers } from "@/lib/actions/drivers"
import { ClientPage } from "@/components/client-page"

export default async function Home() {
  const [rides, drivers] = await Promise.all([getRides(), getDrivers()])

  return <ClientPage initialRides={rides} initialDrivers={drivers} />
}
