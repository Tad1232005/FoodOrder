import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image, url }) => {
    const siteName = "FoodOrder";
    const defaultDesc = "Order delicious food online - fast delivery to your door";
    const defaultImg = "/logo-512.jpg";

    return (
        <Helmet>
            {/* Basic */}
            <title>{title ? `${title} | ${siteName}` : siteName}</title>
            <meta name="description" content={description || defaultDesc} />

            {/* Open Graph (Facebook, Zalo) */}
            <meta property="og:title" content={title || siteName} />
            <meta property="og:description" content={description || defaultDesc} />
            <meta property="og:image" content={image || defaultImg} />
            <meta property="og:url" content={url || window.location.href} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteName} />
            <meta name="twitter:description" content={description || defaultDesc} />
            <meta name="twitter:image" content={image || defaultImg} />
        </Helmet>
    );
};

export default SEO;