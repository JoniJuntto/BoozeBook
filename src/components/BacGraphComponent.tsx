import React, { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { parseISO, addHours, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Database } from "../integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Drink = Database["public"]["Tables"]["drinks"]["Row"];

interface BacGraphProps {
  profile: Profile;
  drinks: Drink[];
}

const chartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "#1a1a1a",
  backgroundGradientTo: "#1a1a1a",
  decimalPlaces: 3,
  color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: "rgba(255,255,255,0.1)",
  },
  propsForLabels: {
    fontSize: 12,
  },
};

export default function BacGraphComponent({ profile, drinks }: BacGraphProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  
  const calculateBacAtTime = (targetTime: Date) => {
    if (!profile || !drinks.length) return 0;

    const userWeight = profile?.weight_kg ?? 75;
    const userGender = profile?.gender ?? "male";
    const GENDER_CONSTANT = userGender === "female" ? 0.55 : 0.68;
    const METABOLISM_RATE = 0.015;

    let totalBAC = 0;
    
    drinks.forEach((drink) => {
      const drinkTime = parseISO(drink.consumed_at);
      const hoursSinceDrink = (targetTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceDrink >= 0) {
        // Convert drink volume and alcohol percentage to grams of alcohol
        const alcoholGrams = drink.volume_ml * (drink.alcohol_percentage / 100) * 0.789;
        
        // Calculate initial BAC from this drink
        const drinkBAC = (alcoholGrams * 100) / (userWeight * 1000 * GENDER_CONSTANT);
        
        // Subtract metabolized alcohol
        const metabolized = METABOLISM_RATE * hoursSinceDrink;
        const remainingBAC = Math.max(0, drinkBAC - metabolized);
        
        totalBAC += remainingBAC;
      }
    });

    return Math.round(totalBAC * 1000) / 1000;
  };

  const graphData = useMemo(() => {
    const now = new Date();
    const dataPoints = [];
    const labels = [];
    const legalLimitPoints = [];
    
    // Generate data points for past 12 hours to future 6 hours
    for (let i = -12; i <= 6; i += 2) {
      const time = addHours(now, i);
      dataPoints.push(calculateBacAtTime(time));
      legalLimitPoints.push(0.05); // Add legal limit point
      labels.push(format(time, 'HH:mm'));
    }
    
    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: legalLimitPoints,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 1,
          withDots: false,
        }
      ],
      legend: [t('analytics.bacLevel'), t('analytics.legalLimit')]
    };
  }, [drinks, profile]);

  const getCurrentBAC = () => {
    return calculateBacAtTime(new Date());
  };

  const currentBAC = getCurrentBAC();

  return (
    <View className="px-8 py-4  bg-secondary rounded-xl shadow-lg mt-4">
      <Text className="text-xl font-bold mb-4 text-white">
        {t('analytics.bacTimeline')}
      </Text>

      <View className="mb-4 bg-background/40 rounded-lg p-4">
        <Text className="text-gray-400 text-xs uppercase tracking-wider mb-1">
          {t('analytics.currentBac')}
        </Text>
        <View className="flex-row items-baseline">
          <Text className={`text-2xl font-bold ${currentBAC >= 0.08 ? 'text-red-500' : 'text-white'}`}>
            {currentBAC.toFixed(3)}
          </Text>
          <Text className="text-gray-400 text-sm ml-1">BAC</Text>
        </View>
      </View>

      <LineChart
        data={graphData}
        width={Math.min(screenWidth - 140, 800)} // Cap maximum width
        height={Math.min(220, screenWidth * 0.4)} // Responsive height
        chartConfig={{
          ...chartConfig,
          paddingRight: 16,
        }}
        bezier
        withDots={false}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero
        segments={4}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <View className="mt-4">
        <Text className="text-xs text-gray-400">
          {t('analytics.bacDisclaimer')}
        </Text>
      </View>
    </View>
  );
} 