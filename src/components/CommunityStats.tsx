import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useCommunityStore } from "../stores/communityStore";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useWindowDimensions } from "react-native";
import { format, parseISO } from "date-fns";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

const StatCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) => (
  <View className="p-4 w-2/5 mx-4 bg-background/80 rounded-lg mb-4">
    <Text className="text-sm text-gray-300">{title}</Text>
    <Text className="text-2xl font-bold text-white">{value}</Text>
    <Text className="text-xs text-gray-400">{subtitle}</Text>
  </View>
);

export default function CommunityStats() {
  const { width } = useWindowDimensions();
  const { drinks, totalUsers, loading, error, fetchCommunityData } =
    useCommunityStore();

  useEffect(() => {
    fetchCommunityData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#8884d8" />;
  }

  if (error) {
    return <Text className="text-red-500">{error}</Text>;
  }

  // Calculate enhanced community statistics
  const totalDrinks = drinks.length;
  const totalVolume = drinks.reduce((sum, drink) => sum + drink.volume_ml, 0);
  const totalCost = drinks.reduce((sum, drink) => sum + (drink.cost || 0), 0);
  const averageAlcoholPercentage =
    drinks.reduce((sum, drink) => sum + drink.alcohol_percentage, 0) /
    totalDrinks;

  // Location-based stats
  const processLocationStats = () => {
    const locationStats = drinks.reduce((acc, drink) => {
      if (drink.location) {
        acc[drink.location] = (acc[drink.location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Return default data if no locations are recorded
    if (Object.keys(locationStats).length === 0) {
      return [
        {
          name: "No location data",
          population: 1,
          color: "#999999",
          legendFontColor: "#fff",
          legendFontSize: 12,
        },
      ];
    }

    return Object.entries(locationStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count], index) => ({
        name: location,
        population: count,
        color: COLORS[index % COLORS.length],
        legendFontColor: "#fff",
      }));
  };

  const topLocations = processLocationStats();

  // Weekly pattern stats
  const processWeeklyData = () => {
    const weeklyData = drinks.reduce((acc, drink) => {
      const day = format(parseISO(drink.consumed_at), "EEEE");
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      labels: weekDays,
      datasets: [
        {
          data: weekDays.map((day) => weeklyData[day] || 0),
        },
      ],
    };
  };

  const barData = processWeeklyData();

  const maxValue = Math.max(...barData.datasets[0].data);
  const yAxisMax = Math.ceil(maxValue / 5) * 5; // Round up to nearest 5

  return (
    <View className="space-y-6">
      {/* Community Overview Stats */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <StatCard
          title="Total Drinks Logged"
          value={totalDrinks.toString()}
          subtitle="Community drinks"
        />
        <StatCard
          title="Total Volume"
          value={`${(totalVolume / 1000).toFixed(1)}L`}
          subtitle="Combined consumption"
        />
        <StatCard
          title="Community Spending"
          value={`$${totalCost.toFixed(0)}`}
          subtitle="Total spent on drinks"
        />
        <StatCard
          title="Avg. Alcohol %"
          value={`${averageAlcoholPercentage.toFixed(1)}%`}
          subtitle="Across all drinks"
        />
      </View>

      {/* Weekly Pattern Chart */}
      <View>
        <Text className="text-lg font-semibold text-white mb-4">
          Weekly Drinking Pattern
        </Text>
        <BarChart
          data={barData}
          width={width - 64}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          withInnerLines={true}
          showBarTops={false}
          fromZero={true}
          segments={5}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "#1a1a1a",
            backgroundGradientTo: "#1a1a1a",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            barPercentage: 0.7,
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: "rgba(255,255,255,0.1)",
            },
            propsForLabels: {
              fontSize: 12,
            },
          }}
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
          }}
        />
      </View>

      {/* Popular Locations Chart */}
      <View>
        <Text className="text-lg font-semibold text-white mb-4">
          Popular Drinking Spots
        </Text>
        <PieChart
          data={topLocations}
          width={width - 64}
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
    </View>
  );
}
