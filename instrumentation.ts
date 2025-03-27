import { destinyApi } from "@/lib/destinyApi"

export async function register() {
    await destinyApi.getManifestData();
}