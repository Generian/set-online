import Head from "next/head"

export const HeadComponent = ({
  children,
  title = "Play Set online!",
  description = "Web-based online version of the card game Set.",
}: {
  children?: JSX.Element
  title?: string
  description?: string
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  )
}
