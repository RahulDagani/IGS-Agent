import Cookies from "js-cookie";

export function getSecureFileUrl(url: string | null | undefined): string {
    if (!url) return "#";
    const token = Cookies.get("token");
    if (!token) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}token=${token}`;
}
