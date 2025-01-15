export default {
    translation: {
      common: {
        add: 'Lisää juoma',
        login: 'Kirjaudu sisään',
        home: 'Koti',
        analytics: 'Analytiikka',
        camera: 'Kamera',
        bacEstimate: 'BAC arviointi',
        lastDrink: 'Viimeisin juoma klo:',
        status: {
            sober: 'Selvänä', // Ei humalassa, täysin selvä tila.
            legally_intoxicated: 'Lain mukaan humalassa', // Lain mukaan humalassa (esim. ylittää promillerajan).
            impaired: 'Toimintakyky heikentynyt', // Humalatila, joka vaikuttaa toimintakykyyn, mutta ei välttämättä ylitä juridista päihtymysrajaa.
            slightly_impaired: 'Lievästi heikentynyt toimintakyky', // Lievä humalatila, jossa vaikutus on vähäistä, mutta havaittavaa.
            no_recent_drinks: 'Ei viimeisimpiä juomia', // Ei viimeisimpiä juomia.
        },
        bacEstimateLegalNotice: 'BAC (Blood Alcohol Concentration) on mittari, joka kuvaa veressä olevan alkoholin määrää. Tämä on vain arvio ja se ei välttämättä vastaa todellista BAC arvoa.',
        memberSince: 'Jäsen alkaen',
        appVersion: 'Sovelluksen versio',
        bacSettings: 'BAC asetukset',
        bacEstimateDescription: 'Veren alkoholipitoisuuden (BAC) arvioimiseen käytetään painoa ja sukupuolta. Tämä on vain likimääräinen ja voi vaihdella aineenvaihdunnan, ruoan saannin ja muiden terveystekijöiden mukaan. Älä koskaan käytä näitä arvioita turvallisuuskriittisiin päätöksiin.',
      },
      alerts: {
        success: 'Onnistui',
        error: 'Virhe',
        warning: 'Varoitus',
        loginRequired: 'Kirjaudu sisään',
        drinkLogged: 'Juoma lisätty!',
        productNotFound: 'Tuotetta ei löytynyt',
        pleaseLogin: 'Kirjaudu sisään, jotta voit seurata omaa juomistasi',
        failedToLog: 'Juoman lisääminen epäonnistui',
      },
      home: {
        communityInsights: 'Yhteisön statistiikka',
        last30Days: 'Viimeinen 30 päivää',
      },
    },
  };