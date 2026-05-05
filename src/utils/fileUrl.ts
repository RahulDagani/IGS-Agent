import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export async function openSecureFile(url: string | null | undefined): Promise<void> {
    if (!url) return;

    const token = Cookies.get("token");
    if (!token) return;

    const match = url.match(/\/uploads\/([^/?]+\/[^/?]+)/);
    if (!match) {
        window.open(url, "_blank");
        return;
    }

    const file = match[1];

    try {
        const res = await fetch(`${BASE_URL}/files/sign?file=${encodeURIComponent(file)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.url) {
            window.open(data.url, "_blank");
        }
    } catch {
        // silent fail
    }
}
