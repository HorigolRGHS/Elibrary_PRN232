import { UserHeader } from "@/components/layout/header";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <UserHeader />
      {children}
    </>
  );
}
