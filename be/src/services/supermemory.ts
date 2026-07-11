import Supermemory from "supermemory";

export const supermemory = new Supermemory({
    apiKey: process.env.YOUR_LOCAL_SM_KEY!,
    baseURL: "http://localhost:6767"
});