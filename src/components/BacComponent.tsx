import {
  differenceInHours,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import type { Database } from "../integrations/supabase/types";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Drink = Database["public"]["Tables"]["drinks"]["Row"];

export default function BacComponent({
  profile,
  drinks,
}: {
  profile: Profile;
  drinks: Drink[];
}) {
  const calculateBAC = () => {
    const userWeight = profile?.weight_kg ?? 75;
    const userGender = profile?.gender ?? "male";
    const GENDER_CONSTANT = userGender === "female" ? 0.55 : 0.68;
    const WEIGHT_KG = userWeight;
    const METABOLISM_RATE = 0.015;
    const now = new Date();

    const recentDrinks = drinks.filter((drink) => {
      const drinkDate = parseISO(drink.consumed_at);
      return isToday(drinkDate) || isYesterday(drinkDate);
    });

    if (recentDrinks.length === 0) {
      return {
        bac: 0,
        recentDrinks: [],
        lastDrink: null,
        timeSinceLastDrink: null,
        status: "No recent drinks",
      };
    }

    const sortedDrinks = recentDrinks.sort(
      (a, b) =>
        parseISO(b.consumed_at).getTime() - parseISO(a.consumed_at).getTime()
    );

    let totalBAC = 0;
    const lastDrinkTime = parseISO(sortedDrinks[0].consumed_at);
    const hoursSinceLastDrink = differenceInHours(now, lastDrinkTime);

    sortedDrinks.forEach((drink) => {
      const drinkTime = parseISO(drink.consumed_at);
      const hoursSinceDrink = differenceInHours(now, drinkTime);

      const alcoholGrams =
        drink.volume_ml * (drink.alcohol_percentage / 100) * 0.789;

      const drinkBAC =
        (alcoholGrams * 100) / (WEIGHT_KG * 1000 * GENDER_CONSTANT);

      const metabolized = METABOLISM_RATE * hoursSinceDrink;
      const remainingBAC = Math.max(0, drinkBAC - metabolized);

      totalBAC += remainingBAC;
    });

    totalBAC = Math.round(totalBAC * 10000) / 10000;

    let status = "Sober";
    if (totalBAC > 0.05) status = "legally_intoxicated";
    else if (totalBAC > 0.03) status = "impaired";
    else if (totalBAC > 0.01) status = "slightly_impaired";

    return {
      bac: totalBAC,
      recentDrinks: sortedDrinks,
      lastDrink: lastDrinkTime,
      timeSinceLastDrink: hoursSinceLastDrink,
      status,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sober":
        return "text-green-500";
      case "Legally intoxicated":
        return "text-yellow-500";
      case "Impaired":
        return "text-red-500";
      case "Slightly impaired":
        return "text-orange-300";
      default:
        return "text-gray-500";
    }
  };

  const bacData = calculateBAC();
  const { t } = useTranslation();

  return (
    <View className="p-6 bg-secondary rounded-xl shadow-lg ">
      <Text className="text-xl font-bold mb-4 text-white">
        {t('common.bacEstimate')}
      </Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-3xl font-bold text-highlight">
          {(bacData.bac * 100).toFixed(3)}‰
        </Text>
        <Text
          className={`text-lg font-semibold ${getStatusColor(bacData.status)}`}
        >
          {t(`common.status.${bacData.status}`)}
        </Text>
        
      </View>
      <Text className="text-sm text-gray-100 my-2">
          {t('common.lastDrink')} {bacData.lastDrink?.toLocaleTimeString()}
        </Text>
        <Text className="text-sm text-gray-400">
          {t('common.bacEstimateLegalNotice')}
        </Text>
    </View>
  );
}
