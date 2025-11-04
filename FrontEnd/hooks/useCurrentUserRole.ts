import { useEffect, useState } from "react";

interface DecodedToken {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Decode JWT token manually
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  try {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
  } catch (error) {
    console.error("Error reading cookie:", error);
  }
  return null;
}

export function useCurrentUserRole(): string | null {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get token from cookie
      const token = getCookie("token");
      if (!token) {
        setRole(null);
        return;
      }

      // Decode token
      const decoded = decodeToken(token);
      
      // Get role from claims - try common role claim names
      const roleValue = 
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded?.role ||
        decoded?.Role ||
        null;
      
      if (roleValue) {
        setRole(String(roleValue).toLowerCase());
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error extracting user role:", error);
      setRole(null);
    }
  }, []);

  return role;
}
