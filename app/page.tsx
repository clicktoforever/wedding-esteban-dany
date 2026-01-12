import Link from 'next/link'
import Image from 'next/image'
import MobileMenu from '@/components/navigation/MobileMenu'
import RSVPButton from '@/components/RSVPButton'
import { Suspense } from 'react'

export const revalidate = 60

export default async function Page() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-neutral-bg/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 py-4">
          <div className="flex items-center justify-between lg:justify-center gap-8 lg:gap-12">
            {/* Logo - Always visible on mobile, centered on desktop */}
            <Link href="/" className="lg:hidden">
              <svg 
                width="50" 
                height="50" 
                viewBox="0 0 104 104" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-neutral-text"
              >
                <path d="M67.5519 62.5593C67.5529 62.5525 67.5533 62.5515 67.552 62.5587L67.5519 62.5593Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M31.686 35.5772C32.8083 35.7544 33.8118 36.2135 34.6872 36.9488C35.4963 37.6285 35.9465 38.5294 36.0588 39.607H36.6575L37.1533 33.8218C34.2917 32.8975 31.9293 32.4481 30.0521 32.4481C25.0539 32.4481 20.6582 34.3659 16.8434 38.2432C13.0596 42.0895 11.186 46.5035 11.186 51.5064C11.186 55.4655 12.5575 59.0059 15.3248 62.1468C18.1239 65.2876 21.2657 66.8152 24.7643 66.8152C27.6531 66.8152 30.3501 66.1329 32.8639 64.7674C34.793 63.7195 37.0144 61.9514 39.1105 59.8595L39.8236 59.1478L40.0436 60.1311C40.4118 61.7774 41.292 63.1606 42.7096 64.2908C44.6668 65.8258 47.3368 66.623 50.7781 66.623C54.2172 66.623 57.1386 65.8423 59.567 64.3054L59.5696 64.3037C60.7618 63.5586 61.7402 62.4958 62.5009 61.0962C63.2545 59.7095 63.67 58.0821 63.7318 56.1992L63.7561 55.4561L64.4615 55.6912C64.5742 55.7288 64.764 55.7589 65.0553 55.7589C66.3447 55.7589 67.6217 55.2377 68.896 54.1213L70.4891 52.7294L69.7795 54.7369L66.3107 63.7873L66.3085 63.7927C65.9373 64.7039 65.4747 65.4247 64.8915 65.8913L64.8824 65.8986L64.873 65.9054C64.248 66.3638 63.3325 66.5416 62.2376 66.5416H62.1192V66.7783H70.4318V66.5416H70.2174C69.0795 66.5416 68.2491 66.497 67.8121 66.3778C67.5832 66.3154 67.3502 66.2116 67.1692 66.0306C66.9738 65.8352 66.8746 65.5845 66.8746 65.3139C66.8746 64.9294 67.0139 64.3578 67.2361 63.659C67.3474 63.2933 67.4298 63.0146 67.484 62.8209C67.5113 62.7233 67.5303 62.6515 67.542 62.603C67.5443 62.5936 67.5461 62.5857 67.5476 62.5793V62.5181L70.8953 53.8952H83.7707L87.1801 62.8198L87.1839 62.8311C87.3449 63.3141 87.4675 63.6979 87.5503 63.9797C87.5917 64.1201 87.6247 64.2407 87.6479 64.3382C87.6666 64.4165 87.6931 64.5347 87.6931 64.6409C87.6931 65.2625 87.4336 65.7836 86.9074 66.1184C86.4238 66.4261 85.7693 66.5416 85.0233 66.5416H84.0397V66.7783H95.2365V66.5416H94.0606C93.2663 66.5416 92.5697 66.3421 92.0514 65.867L92.0336 65.8507L92.0173 65.833C91.613 65.3919 91.2327 64.7769 90.8683 64.015L90.8586 63.9946L79.2754 33.6712C79.2676 33.6834 79.2597 33.6957 79.2517 33.7081C79.1548 33.8579 79.0151 34.0564 78.8367 34.2996L78.8313 34.307L78.8256 34.3143C78.463 34.7757 78.0684 35.236 77.6422 35.695L77.6352 35.7025L77.628 35.7098C77.4119 35.9258 77.2174 36.104 77.0475 36.2361C76.9778 36.2903 76.8962 36.3499 76.8066 36.4024L72.0029 48.9358L71.9852 48.9683C71.7974 49.3124 71.6335 49.6351 71.4794 49.9405L71.4376 50.0235C71.3 50.2963 71.1675 50.559 71.0355 50.802C70.7456 51.3355 70.4307 51.8267 69.986 52.2134C69.1361 52.9524 68.0888 53.311 66.882 53.311C66.6281 53.311 66.2712 53.2559 65.8439 53.1672C65.4047 53.076 64.8527 52.9409 64.1905 52.7632L64.1871 52.7623C62.9344 52.4178 61.8807 52.2534 61.0173 52.2534C58.3601 52.2534 55.8501 54.2159 53.5514 58.5618L53.8446 58.6455C54.678 57.3279 55.4932 56.3306 56.2963 55.6882C57.2134 54.9545 58.352 54.6052 59.6713 54.6052C60.6276 54.6052 61.4254 54.7177 62.0035 54.9968C62.3001 55.14 62.5583 55.3364 62.7416 55.6018C62.928 55.8717 63.0141 56.1804 63.0141 56.5058C63.0141 59.3242 62.1007 61.4871 60.1883 62.8682C58.3401 64.2031 55.99 64.848 53.1817 64.848C50.3561 64.848 48.0725 64.0811 46.4045 62.4826C44.7638 60.9102 43.9262 59.0216 43.9262 56.8423C43.9262 55.3241 44.2304 53.9261 44.8473 52.6579L44.8518 52.6486L44.8567 52.6395C45.1454 52.0981 45.538 51.6015 46.0262 51.1481C46.5157 50.6913 46.9501 50.3227 47.3273 50.0484L47.3364 50.0417L47.3458 50.0354C47.7762 49.7485 48.3437 49.4762 49.0317 49.2136C49.6986 48.928 50.2542 48.7145 50.6929 48.5784C51.1277 48.4122 51.7283 48.2181 52.4875 47.9965C53.0403 47.8122 53.4821 47.6621 53.8142 47.5459L53.8761 46.844C51.0478 46.6897 48.7602 46.0741 47.0594 44.9509L47.0554 44.9482C45.268 43.7452 44.3107 42.1766 44.3107 40.2578C44.3107 38.3749 44.8985 36.8737 46.151 35.8607C47.381 34.8658 49.1635 34.4153 51.4031 34.4153C54.0332 34.4153 56.0953 34.7856 57.5176 35.5933C58.8299 36.3385 59.5755 37.4463 59.7195 38.8698L60.2319 38.9019L60.7187 34.1965C59.0342 33.1778 56.6839 32.6404 53.6143 32.6404C50.4165 32.6404 47.6813 33.4765 45.3831 35.1307C43.1565 36.7562 42.0551 38.9284 42.0551 41.6999C42.0551 43.352 42.609 44.7324 43.7193 45.8744C44.8472 46.9706 46.4332 47.5917 48.5429 47.6835L52.0002 47.8761L48.6076 48.7851C46.3556 49.1503 44.3243 50.184 42.5072 51.9088L42.5036 51.9122C42.0421 52.3424 41.6408 52.8022 41.2996 53.2926L40.1494 55.7808C39.9931 56.3669 39.8969 56.9847 39.8604 57.6348L39.8495 57.83L39.7185 57.9752C38.0371 59.8398 36.0034 61.5452 34.1576 62.524C31.9916 63.6727 29.9784 64.2712 28.1293 64.2712C25.187 64.2712 22.1576 63.087 19.0513 60.7981L19.0475 60.7953C17.4226 59.5766 16.0892 57.8483 15.0341 55.6392C13.9677 53.4065 13.4417 50.8711 13.4417 48.0453C13.4417 44.109 14.8861 40.9623 17.7864 38.669C20.6464 36.4076 24.0062 35.2806 27.8408 35.2806C29.3623 35.2806 30.6471 35.3771 31.686 35.5772ZM71.2365 52.9855H83.3259L77.3366 37.1251L71.2365 52.9855Z" fill="currentColor"/>
                <circle cx="52" cy="52" r="51.3067" stroke="currentColor" strokeWidth="1.38667"/>
              </svg>
            </Link>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-8 lg:gap-12">
              <Link 
                href="/" 
                className="nav-link"
              >
                Home
              </Link>
              <Link 
                href="#our-story" 
                className="nav-link"
              >
                Nuestra Historia
              </Link>
              <Link 
                href="#venue" 
                className="nav-link"
              >
                Lugar
              </Link>
              
              {/* Logo - Desktop */}
              <div className="flex items-center justify-center px-10">
                <svg 
                  width="80" 
                  height="80" 
                  viewBox="0 0 104 104" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-neutral-text"
                >
                  <path d="M67.5519 62.5593C67.5529 62.5525 67.5533 62.5515 67.552 62.5587L67.5519 62.5593Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M31.686 35.5772C32.8083 35.7544 33.8118 36.2135 34.6872 36.9488C35.4963 37.6285 35.9465 38.5294 36.0588 39.607H36.6575L37.1533 33.8218C34.2917 32.8975 31.9293 32.4481 30.0521 32.4481C25.0539 32.4481 20.6582 34.3659 16.8434 38.2432C13.0596 42.0895 11.186 46.5035 11.186 51.5064C11.186 55.4655 12.5575 59.0059 15.3248 62.1468C18.1239 65.2876 21.2657 66.8152 24.7643 66.8152C27.6531 66.8152 30.3501 66.1329 32.8639 64.7674C34.793 63.7195 37.0144 61.9514 39.1105 59.8595L39.8236 59.1478L40.0436 60.1311C40.4118 61.7774 41.292 63.1606 42.7096 64.2908C44.6668 65.8258 47.3368 66.623 50.7781 66.623C54.2172 66.623 57.1386 65.8423 59.567 64.3054L59.5696 64.3037C60.7618 63.5586 61.7402 62.4958 62.5009 61.0962C63.2545 59.7095 63.67 58.0821 63.7318 56.1992L63.7561 55.4561L64.4615 55.6912C64.5742 55.7288 64.764 55.7589 65.0553 55.7589C66.3447 55.7589 67.6217 55.2377 68.896 54.1213L70.4891 52.7294L69.7795 54.7369L66.3107 63.7873L66.3085 63.7927C65.9373 64.7039 65.4747 65.4247 64.8915 65.8913L64.8824 65.8986L64.873 65.9054C64.248 66.3638 63.3325 66.5416 62.2376 66.5416H62.1192V66.7783H70.4318V66.5416H70.2174C69.0795 66.5416 68.2491 66.497 67.8121 66.3778C67.5832 66.3154 67.3502 66.2116 67.1692 66.0306C66.9738 65.8352 66.8746 65.5845 66.8746 65.3139C66.8746 64.9294 67.0139 64.3578 67.2361 63.659C67.3474 63.2933 67.4298 63.0146 67.484 62.8209C67.5113 62.7233 67.5303 62.6515 67.542 62.603C67.5443 62.5936 67.5461 62.5857 67.5476 62.5793V62.5181L70.8953 53.8952H83.7707L87.1801 62.8198L87.1839 62.8311C87.3449 63.3141 87.4675 63.6979 87.5503 63.9797C87.5917 64.1201 87.6247 64.2407 87.6479 64.3382C87.6666 64.4165 87.6931 64.5347 87.6931 64.6409C87.6931 65.2625 87.4336 65.7836 86.9074 66.1184C86.4238 66.4261 85.7693 66.5416 85.0233 66.5416H84.0397V66.7783H95.2365V66.5416H94.0606C93.2663 66.5416 92.5697 66.3421 92.0514 65.867L92.0336 65.8507L92.0173 65.833C91.613 65.3919 91.2327 64.7769 90.8683 64.015L90.8586 63.9946L79.2754 33.6712C79.2676 33.6834 79.2597 33.6957 79.2517 33.7081C79.1548 33.8579 79.0151 34.0564 78.8367 34.2996L78.8313 34.307L78.8256 34.3143C78.463 34.7757 78.0684 35.236 77.6422 35.695L77.6352 35.7025L77.628 35.7098C77.4119 35.9258 77.2174 36.104 77.0475 36.2361C76.9778 36.2903 76.8962 36.3499 76.8066 36.4024L72.0029 48.9358L71.9852 48.9683C71.7974 49.3124 71.6335 49.6351 71.4794 49.9405L71.4376 50.0235C71.3 50.2963 71.1675 50.559 71.0355 50.802C70.7456 51.3355 70.4307 51.8267 69.986 52.2134C69.1361 52.9524 68.0888 53.311 66.882 53.311C66.6281 53.311 66.2712 53.2559 65.8439 53.1672C65.4047 53.076 64.8527 52.9409 64.1905 52.7632L64.1871 52.7623C62.9344 52.4178 61.8807 52.2534 61.0173 52.2534C58.3601 52.2534 55.8501 54.2159 53.5514 58.5618L53.8446 58.6455C54.678 57.3279 55.4932 56.3306 56.2963 55.6882C57.2134 54.9545 58.352 54.6052 59.6713 54.6052C60.6276 54.6052 61.4254 54.7177 62.0035 54.9968C62.3001 55.14 62.5583 55.3364 62.7416 55.6018C62.928 55.8717 63.0141 56.1804 63.0141 56.5058C63.0141 59.3242 62.1007 61.4871 60.1883 62.8682C58.3401 64.2031 55.99 64.848 53.1817 64.848C50.3561 64.848 48.0725 64.0811 46.4045 62.4826C44.7638 60.9102 43.9262 59.0216 43.9262 56.8423C43.9262 55.3241 44.2304 53.9261 44.8473 52.6579L44.8518 52.6486L44.8567 52.6395C45.1454 52.0981 45.538 51.6015 46.0262 51.1481C46.5157 50.6913 46.9501 50.3227 47.3273 50.0484L47.3364 50.0417L47.3458 50.0354C47.7762 49.7485 48.3437 49.4762 49.0317 49.2136C49.6986 48.928 50.2542 48.7145 50.6929 48.5784C51.1277 48.4122 51.7283 48.2181 52.4875 47.9965C53.0403 47.8122 53.4821 47.6621 53.8142 47.5459L53.8761 46.844C51.0478 46.6897 48.7602 46.0741 47.0594 44.9509L47.0554 44.9482C45.268 43.7452 44.3107 42.1766 44.3107 40.2578C44.3107 38.3749 44.8985 36.8737 46.151 35.8607C47.381 34.8658 49.1635 34.4153 51.4031 34.4153C54.0332 34.4153 56.0953 34.7856 57.5176 35.5933C58.8299 36.3385 59.5755 37.4463 59.7195 38.8698L60.2319 38.9019L60.7187 34.1965C59.0342 33.1778 56.6839 32.6404 53.6143 32.6404C50.4165 32.6404 47.6813 33.4765 45.3831 35.1307C43.1565 36.7562 42.0551 38.9284 42.0551 41.6999C42.0551 43.352 42.609 44.7324 43.7193 45.8744C44.8472 46.9706 46.4332 47.5917 48.5429 47.6835L52.0002 47.8761L48.6076 48.7851C46.3556 49.1503 44.3243 50.184 42.5072 51.9088L42.5036 51.9122C42.0421 52.3424 41.6408 52.8022 41.2996 53.2926L40.1494 55.7808C39.9931 56.3669 39.8969 56.9847 39.8604 57.6348L39.8495 57.83L39.7185 57.9752C38.0371 59.8398 36.0034 61.5452 34.1576 62.524C31.9916 63.6727 29.9784 64.2712 28.1293 64.2712C25.187 64.2712 22.1576 63.087 19.0513 60.7981L19.0475 60.7953C17.4226 59.5766 16.0892 57.8483 15.0341 55.6392C13.9677 53.4065 13.4417 50.8711 13.4417 48.0453C13.4417 44.109 14.8861 40.9623 17.7864 38.669C20.6464 36.4076 24.0062 35.2806 27.8408 35.2806C29.3623 35.2806 30.6471 35.3771 31.686 35.5772ZM71.2365 52.9855H83.3259L77.3366 37.1251L71.2365 52.9855Z" fill="currentColor"/>
                  <circle cx="52" cy="52" r="51.3067" stroke="currentColor" strokeWidth="1.38667"/>
                </svg>
              </div>
              
              <Link 
                href="#itinerary" 
                className="nav-link"
              >
                Itinerario
              </Link>
              <Link 
                href="/gifts" 
                className="nav-link"
              >
                Regalos
              </Link>
              <Link 
                href="#rsvp" 
                className="nav-link"
              >
                RSVP
              </Link>
            </div>

            {/* Mobile Menu Component */}
            <MobileMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-neutral-bg pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 w-full">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <p className="text-wedding-primary font-montaga text-xl md:text-2xl mb-4">
              Los invitamos a celebrar
            </p>
            <h1 className="font-montaga text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-neutral-text mb-6 leading-none">
              Esteban & Dany
            </h1>
            <div className="flex items-center justify-center gap-4 text-wedding-primary font-montaga text-lg md:text-xl">
              <span>10 de Abril, 2025</span>
              <div className="w-4 h-px bg-wedding-primary"></div>
              <span>Ciudad de México</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
            <Image
              src="https://api.builder.io/api/v1/image/assets/TEMP/eed30a5bdcfeaad2b7e0155aacf2b1d7110fc0f9?width=2242"
              alt="Esteban & Dany"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="relative bg-wedding-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side - Title */}
            <div>
              <h2 className="font-montaga text-6xl md:text-7xl lg:text-8xl text-neutral-bg leading-none">
                Nuestra Historia
              </h2>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-6 text-neutral-bg font-montaga text-lg md:text-xl leading-relaxed">
              <p>
                Nuestra historia comenzó en un momento inesperado, cuando el destino nos unió 
                en el lugar y momento perfectos. Desde ese primer encuentro, supimos que 
                habíamos encontrado algo especial.
              </p>
              
              <p>
                A través de los años, hemos compartido risas, aventuras, y momentos que han 
                forjado el amor que nos une. Cada día juntos ha sido un regalo, y cada 
                experiencia compartida nos ha acercado más.
              </p>
              
              <p>
                Ahora, estamos emocionados de comenzar este nuevo capítulo de nuestras vidas, 
                y queremos que seas parte de este momento tan especial. Únete a nosotros 
                mientras celebramos nuestro amor y compromiso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      <section className="relative bg-neutral-bg py-0">
        <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden">
          <Image
            src="https://api.builder.io/api/v1/image/assets/TEMP/4f1b72484ecac114be45f3372090170a3fa37393?width=2882"
            alt="Nuestra historia"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* Venue Section */}
      <section id="venue" className="relative bg-neutral-bg py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <p className="text-wedding-primary font-montaga text-lg">
                El Lugar
              </p>
              
              <h2 className="font-montaga text-4xl md:text-5xl lg:text-6xl text-neutral-text leading-tight">
                Jardín de Eventos Casa Blanca
              </h2>
              
              <div className="space-y-4 text-neutral-text/80 font-montaga text-lg leading-relaxed">
                <p>
                  Un espacio elegante y romántico rodeado de naturaleza, perfecto para 
                  celebrar nuestro amor con las personas más importantes de nuestras vidas.
                </p>
                <p className="font-medium">
                  Av. Revolución 1234<br />
                  Ciudad de México, 01000
                </p>
              </div>
            </div>

            {/* Right Side - Stacked Photos */}
            <div className="relative h-[400px] md:h-[500px]">
              <div className="absolute w-full h-[320px] md:h-[400px] -rotate-6 overflow-hidden shadow-lg">
                <Image
                  src="https://api.builder.io/api/v1/image/assets/TEMP/1e4fa262a269c8426fb986986ff069d2dbf213f6?width=994"
                  alt="Venue"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute w-full h-[320px] md:h-[400px] rotate-6 overflow-hidden shadow-lg">
                <Image
                  src="https://api.builder.io/api/v1/image/assets/TEMP/b962778c53346c3c343e6a5cc856ba2a695f93bb?width=994"
                  alt="Venue detail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute w-full h-[320px] md:h-[400px] top-12 overflow-hidden shadow-xl">
                <Image
                  src="https://api.builder.io/api/v1/image/assets/TEMP/64493c339665b3da8a809d805d1adba2b0ab61eb?width=990"
                  alt="Venue atmosphere"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <section className="bg-neutral-bg py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-wedding-primary/60 to-transparent opacity-60"></div>
        </div>
      </section>

      {/* Accommodations */}
      <section className="bg-neutral-bg py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Hotel 1 */}
            <div className="space-y-8">
              <h3 className="font-montaga text-3xl md:text-4xl text-neutral-text">
                Hotel Marquis
              </h3>
              <p className="text-neutral-text/80 font-montaga text-base leading-relaxed">
                Hotel de lujo en el corazón de la ciudad, a 10 minutos del lugar de la celebración. 
                Amenidades de primer nivel y servicio excepcional.
              </p>
              <button className="wedding-btn-outline">
                Reservar
              </button>
            </div>

            {/* Hotel 2 */}
            <div className="space-y-8">
              <h3 className="font-montaga text-3xl md:text-4xl text-neutral-text">
                Casa Colonial
              </h3>
              <p className="text-neutral-text/80 font-montaga text-base leading-relaxed">
                Encantadora boutique hotel con arquitectura tradicional mexicana. 
                Ambiente íntimo y acogedor a 15 minutos del evento.
              </p>
              <button className="wedding-btn-outline">
                Reservar
              </button>
            </div>

            {/* Hotel 3 */}
            <div className="space-y-8">
              <h3 className="font-montaga text-3xl md:text-4xl text-neutral-text">
                Plaza Jardín
              </h3>
              <p className="text-neutral-text/80 font-montaga text-base leading-relaxed">
                Moderno hotel con excelente ubicación y tarifas preferenciales para 
                nuestros invitados. Transporte incluido al evento.
              </p>
              <button className="wedding-btn-outline">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Section */}
      <section id="itinerary" className="bg-neutral-bg py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="font-montaga text-4xl md:text-5xl lg:text-6xl text-neutral-text mb-12">
              Itinerario
            </h2>
            
            {/* Day Tabs */}
            <div className="flex justify-center items-center gap-12 md:gap-16">
              <div className="space-y-1">
                <p className="font-montaga text-lg text-neutral-text">
                  Viernes, 9 de Abril
                </p>
                <div className="h-px bg-wedding-primary"></div>
              </div>
              <p className="font-montaga text-lg text-neutral-text/60">
                Sábado, 10 de Abril
              </p>
              <p className="font-montaga text-lg text-neutral-text/60">
                Domingo, 11 de Abril
              </p>
            </div>
          </div>

          {/* Schedule Items */}
          <div className="space-y-12">
            {/* 6:00 PM */}
            <div className="flex gap-8 md:gap-16">
              <div className="w-32 md:w-48 flex-shrink-0">
                <p className="font-montaga text-2xl text-wedding-primary">
                  6:00 pm
                </p>
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="font-montaga text-2xl md:text-3xl text-neutral-text">
                  Ceremonia
                </h3>
                <p className="font-montaga text-base md:text-lg text-neutral-text/70 leading-relaxed">
                  La ceremonia se llevará a cabo en el jardín principal. Por favor lleguen 
                  con 15 minutos de anticipación para encontrar su asiento y disfrutar del 
                  ambiente previo a la ceremonia.
                </p>
              </div>
            </div>

            {/* 7:30 PM */}
            <div className="flex gap-8 md:gap-16">
              <div className="w-32 md:w-48 flex-shrink-0">
                <p className="font-montaga text-2xl text-wedding-primary">
                  7:30 pm
                </p>
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="font-montaga text-2xl md:text-3xl text-neutral-text">
                  Cóctel
                </h3>
                <p className="font-montaga text-base md:text-lg text-neutral-text/70 leading-relaxed">
                  Después de la ceremonia, los invitamos a disfrutar de un cóctel en la 
                  terraza mientras preparamos el salón para la recepción. Bebidas y canapés 
                  estarán disponibles.
                </p>
              </div>
            </div>

            {/* 8:30 PM */}
            <div className="flex gap-8 md:gap-16">
              <div className="w-32 md:w-48 flex-shrink-0">
                <p className="font-montaga text-2xl text-wedding-primary">
                  8:30 pm
                </p>
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="font-montaga text-2xl md:text-3xl text-neutral-text">
                  Recepción
                </h3>
                <p className="font-montaga text-base md:text-lg text-neutral-text/70 leading-relaxed">
                  La cena y el baile comenzarán en el salón principal. Prepárense para una 
                  noche llena de música, baile, y momentos inolvidables celebrando nuestro amor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="bg-gradient-to-b from-neutral-bg to-wedding-beige py-20 md:py-32">
        <div className="max-w-2xl mx-auto px-6 lg:px-20 text-center">
          <h2 className="font-montaga text-4xl md:text-5xl lg:text-6xl text-neutral-text mb-8">
            Confirma tu Asistencia
          </h2>
          <p className="font-montaga text-lg md:text-xl text-neutral-text/80 mb-12 leading-relaxed">
            Tu presencia es el mejor regalo. Por favor confirma tu asistencia 
            antes del 1 de Marzo de 2025.
          </p>
          <Suspense fallback={
            <Link href="/confirm/tu-codigo" className="wedding-btn-primary">
              Confirmar Asistencia
            </Link>
          }>
            <RSVPButton />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-bg border-t border-neutral-text/10 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="text-center space-y-4">
            <p className="font-montaga text-lg text-neutral-text">
              Esteban & Dany
            </p>
            <p className="font-montaga text-sm text-neutral-text/60">
              10 de Abril, 2025
            </p>
            <p className="text-xs text-neutral-text/40 mt-8">
              © 2025. Con amor para nuestra familia y amigos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Esteban & Dany - Boda 10 de Abril 2025',
    description: 'Te invitamos a celebrar nuestra boda el 10 de Abril, 2025 en Ciudad de México.',
  }
}
