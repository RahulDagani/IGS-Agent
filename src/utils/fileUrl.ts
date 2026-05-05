import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export async function openSecureFile(url: string | null | undefined): Promise<void> {
    if (!url) return;

    const token = Cookies.get("token");
    if (!token) return;

    const match = url.match(/\/uploads\/([^/?]+)\/([^/?]+)/);
    if (!match) {
        window.open(url, "_blank");
        return;
    }

    const folder = match[1];
    const filename = match[2];

    try {
        const res = await fetch(`${BASE_URL}/files/view/${folder}/${encodeURIComponent(filename)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");

        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch {
        // silent fail
    }
}
