import PocketBase from "pocketbase";

if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    throw new Error("NEXT_PUBLIC_POCKETBASE_URL environment variable is not set");
}

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export default pb;