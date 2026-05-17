import { LinkBoxApp } from "@/components/app/linkbox-app";

type LinkDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LinkDetailRoute({ params }: LinkDetailRouteProps) {
  const { id } = await params;

  return <LinkBoxApp detailLinkId={id} route="detail" />;
}
