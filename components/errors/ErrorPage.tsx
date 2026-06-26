import Image from "next/image";

type Props = {
  illustration: string;
  illustrationWidth: number;
  illustrationHeight: number;
  title: string;
  description: React.ReactNode;
  showLogo?: boolean;
  children?: React.ReactNode;
};

export default function ErrorPage({
  illustration,
  illustrationWidth,
  illustrationHeight,
  title,
  description,
  showLogo = false,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col px-[38px] py-16">
      {showLogo && (
        <div className="px-[38px]">
          <Image
            src="/shiro-logo-nav.svg"
            alt="Shiro Studio"
            width={105}
            height={43}
            priority
          />
        </div>
      )}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-9 w-full max-w-[414px] text-center">
          <Image
            src={illustration}
            alt=""
            width={illustrationWidth}
            height={illustrationHeight}
            className="w-auto h-auto"
            priority
          />
          <div className="flex flex-col gap-[18px] w-full">
            <h1 className="heading-2xl text-text-500">{title}</h1>
            <p className="body-lg-regular text-text-500">{description}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
