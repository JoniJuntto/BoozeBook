import React, { useEffect, useMemo } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useCommunityStore } from "../stores/communityStore";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";
import { useWindowDimensions } from "react-native";
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths, getHours } from "date-fns";
import { useTranslation } from "react-i18next";
import CreateSuggestion from "./CreateSuggestion";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

const StatCard = ({ title, value, subtitle }) => (
  <View className="p-4 w-2/5 mx-4 bg-background/80 rounded-lg mb-4">
    <Text className="text-sm text-gray-300">{title}</Text>
    <Text className="text-2xl font-bold text-white">{value}</Text>
    <Text className="text-xs text-gray-400">{subtitle}</Text>
  </View>
);

export default function CommunityStats() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { drinks, totalUsers, loading, error, fetchCommunityData } = useCommunityStore();

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const stats = useMemo(() => {
    if (!drinks.length) return null;

    const totalDrinks = drinks.length;
    const totalVolume = drinks.reduce((sum, drink) => sum + drink.volume_ml, 0);
    const averageAlcoholPercentage = drinks.reduce((sum, drink) => sum + drink.alcohol_percentage, 0) / totalDrinks;

    // Analyze drink types and their average alcohol content
    const drinkTypeAnalysis = drinks.reduce((acc, drink) => {
      if (!acc[drink.type]) {
        acc[drink.type] = {
          count: 0,
          totalAlcohol: 0,
          totalVolume: 0,
        };
      }
      acc[drink.type].count += 1;
      acc[drink.type].totalAlcohol += drink.alcohol_percentage;
      acc[drink.type].totalVolume += drink.volume_ml;
      return acc;
    }, {});

    // Calculate averages for each drink type
    Object.keys(drinkTypeAnalysis).forEach(type => {
      drinkTypeAnalysis[type].avgAlcohol = 
        drinkTypeAnalysis[type].totalAlcohol / drinkTypeAnalysis[type].count;
      drinkTypeAnalysis[type].avgVolume = 
        drinkTypeAnalysis[type].totalVolume / drinkTypeAnalysis[type].count;
    });

    // Time of day analysis
    const hourlyDistribution = drinks.reduce((acc, drink) => {
      const hour = getHours(parseISO(drink.consumed_at));
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Monthly volume trends
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    const monthlyStats = last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthDrinks = drinks.filter(drink => 
        startOfMonth(parseISO(drink.consumed_at)).getTime() === monthStart.getTime()
      );

      return {
        month: format(month, 'MMM'),
        volume: monthDrinks.reduce((sum, drink) => sum + drink.volume_ml, 0) / 1000, // Convert to liters
        avgAlcohol: monthDrinks.length ? 
          monthDrinks.reduce((sum, drink) => sum + drink.alcohol_percentage, 0) / monthDrinks.length : 
          0
      };
    });

    return {
      totalDrinks,
      totalVolume,
      averageAlcoholPercentage,
      drinkTypeAnalysis,
      hourlyDistribution,
      monthlyStats,
    };
  }, [drinks]);

  if (loading) {
    return <ActivityIndicator size="large" color="#8884d8" />;
  }

  if (error) {
    return <Text className="text-red-500">{error}</Text>;
  }

  if (!stats) {
    return <Text className="text-white">No data available</Text>;
  }

  // Prepare drink type data for pie chart
  const drinkTypeData = Object.entries(stats.drinkTypeAnalysis)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([type, data], index) => ({
      name: type,
      population: data.count,
      color: COLORS[index % COLORS.length],
      legendFontColor: "#fff",
    }));

  // Prepare hourly distribution data
  const hourlyData = {
    labels: Array.from({ length: 24 }, (_, i) => i % 3 === 0 ? `${i}:00` : ''),
    datasets: [{
      data: Array.from({ length: 24 }, (_, i) => stats.hourlyDistribution[i] || 0),
    }]
  };

  // Monthly trends data
  const monthlyTrendsData = {
    labels: stats.monthlyStats.map(stat => stat.month),
    datasets: [
      {
        data: stats.monthlyStats.map(stat => stat.avgAlcohol),
        color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
      },
    ],
  };

  return (
    <ScrollView className="space-y-6 px-4">
      <View className="flex-row flex-wrap justify-between mb-6">
        <StatCard
          title={t('home.totalDrinksLogged')}
          value={stats.totalDrinks.toString()}
          subtitle={t('home.communityDrinks')}
        />
        <StatCard
          title={t('home.totalVolume')}
          value={`${(stats.totalVolume / 1000).toFixed(1)}L`}
          subtitle={t('home.combinedConsumption')}
        />
        <StatCard
          title={t('home.avgAlcoholPercentage')}
          value={`${stats.averageAlcoholPercentage.toFixed(1)}%`}
          subtitle={t('home.acrossAllDrinks')}
        />
      </View>

      {/* Drink Types Distribution */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-white mb-4">
          {t('home.drinkTypeDistribution')}
        </Text>
        <PieChart
          data={drinkTypeData}
          width={width - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* Hourly Distribution */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-white mb-4">
          {t('home.hourlyDistribution')}
        </Text>
        <BarChart
          data={hourlyData}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "#1a1a1a",
            backgroundGradientTo: "#1a1a1a",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            barPercentage: 0.7,
          }}
          yAxisLabel=""
          yAxisSuffix="%"
          xAxisLabel=""
          style={{
            borderRadius: 16,
          }}
        />
      </View>

      {/* Monthly Alcohol Content Trends */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-white mb-4">
          {t('home.monthlyAlcoholTrends')}
        </Text>
        <LineChart
          data={monthlyTrendsData}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "#1a1a1a",
            backgroundGradientTo: "#1a1a1a",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#8884d8"
            }
          }}
          bezier
          style={{
            borderRadius: 16,
          }}
        />
      </View>
      <CreateSuggestion />
    </ScrollView>
  );
}