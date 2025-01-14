import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import {
  format,
  parseISO,
  differenceInHours,
  isToday,
  isYesterday,
  startOfToday,
  startOfYesterday,
  getHours,
} from "date-fns";
import type { Database } from "../integrations/supabase/types";
import { supabase } from "../integrations/supabase/client";
import Footer from "./Footer";

type Drink = Database["public"]["Tables"]["drinks"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const chartConfig = {
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
};

const drinkTypeColors = {
  beer: "#F2A65A",
  longDrink: "#4A90E2",
  mixes: "#5DADE2",
  spirits: "#A569BD",
  wine: "#8E4056",
  liqueur: "#C7A379",
  cider: "#D4A054",
};

const timeOfDayColors = {
  "Morning (6-12)": "#FDB813", // Sunny yellow
  "Afternoon (12-17)": "#FF8C42", // Orange
  "Evening (17-22)": "#7B68EE", // Purple-blue
  "Night (22-6)": "#1B2735", // Dark blue
};

const moodColors = {
  happy: "#FFD700", // Gold
  relaxed: "#98FB98", // Pale green
  social: "#87CEEB", // Sky blue
  stressed: "#FF6B6B", // Coral red
  tired: "#DDA0DD", // Plum
};

const locationColors = {
  home: "#4CAF50", // Green
  bar: "#9C27B0", // Purple
  restaurant: "#FF9800", // Orange
  party: "#E91E63", // Pink
  other: "#607D8B", // Blue grey
};

const strengthColors = {
  "Light (0-4%)": "#90EE90", // Light green
  "Medium (4-8%)": "#FFB347", // Orange
  "Strong (8-12%)": "#FF6B6B", // Coral red
  "Very Strong (12%+)": "#8B0000", // Dark red
};

const StatBox = ({
  label,
  value,
  unit = "",
}: {
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <View className="bg-background/40 rounded-lg p-4 flex-1 mx-1">
    <Text className="text-gray-400 text-xs uppercase tracking-wider mb-1">
      {label}
    </Text>
    <View className="flex-row items-baseline">
      <Text className="text-white text-xl font-bold">{value}</Text>
      {unit && <Text className="text-gray-400 text-sm ml-1">{unit}</Text>}
    </View>
  </View>
);

const OwnAnalytics = (props: { profile?: Profile }) => {
  const { width: screenWidth } = useWindowDimensions();

  const [drinks, setDrinks] = useState<Drink[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { profile } = props;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("drinks")
        .select("*")
        .eq("user_id", user?.id)
        .order("consumed_at", { ascending: true });

      setDrinks(data ?? null);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !drinks) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8884d8" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-black">No profile data available</Text>
      </View>
    );
  }

  // Data processing functions
  const processTypeData = () => {
    const drinksByType = drinks.reduce((acc, drink) => {
      acc[drink.type] = (acc[drink.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(drinksByType).map(([name, population]) => ({
      name,
      population,
      color: drinkTypeColors[name as keyof typeof drinkTypeColors] || "#999999", // fallback gray
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const processWeeklyData = () => {
    const weeklyData = drinks.reduce((acc, drink) => {
      const day = format(parseISO(drink.consumed_at), "EEE");
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day) => weeklyData[day] || 0
          ),
        },
      ],
    };
  };

  const processBasicStats = () => {
    if (!drinks.length) return null;

    const totalDrinks = drinks.length;

    // Most frequent drink
    const typeCount = drinks.reduce((acc, drink) => {
      acc[drink.type] = (acc[drink.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostFrequentType = Object.entries(typeCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Average drinks per drinking day
    const drinksByDate = drinks.reduce((acc, drink) => {
      const date = drink.consumed_at.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgDrinksPerDay = (
      totalDrinks / Object.keys(drinksByDate).length
    ).toFixed(1);

    return {
      totalDrinks,
      mostFrequentType: mostFrequentType ? `${mostFrequentType[0]}` : "N/A",
      avgDrinksPerDay,
    };
  };

  const processTimeOfDay = () => {
    const timeSlots = {
      "Morning (6-12)": 0,
      "Afternoon (12-17)": 0,
      "Evening (17-22)": 0,
      "Night (22-6)": 0,
    };

    drinks.forEach((drink) => {
      const hour = getHours(parseISO(drink.consumed_at));
      if (hour >= 6 && hour < 12) timeSlots["Morning (6-12)"]++;
      else if (hour >= 12 && hour < 17) timeSlots["Afternoon (12-17)"]++;
      else if (hour >= 17 && hour < 22) timeSlots["Evening (17-22)"]++;
      else timeSlots["Night (22-6)"]++;
    });

    return Object.entries(timeSlots).map(([name, population]) => ({
      name,
      population,
      color: timeOfDayColors[name as keyof typeof timeOfDayColors],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const processMonthlyTrend = () => {
    const monthlyData = drinks.reduce((acc, drink) => {
      const month = format(parseISO(drink.consumed_at), "MMM");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      labels: months,
      datasets: [
        {
          data: months.map((month) => monthlyData[month] || 0),
        },
      ],
    };
  };

  const processMoodDistribution = () => {
    const moodCounts = drinks.reduce((acc, drink) => {
      if (drink.mood) {
        acc[drink.mood] = (acc[drink.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Return default data if no moods are recorded
    if (Object.keys(moodCounts).length === 0) {
      return [
        {
          name: "No mood data",
          population: 1,
          color: "#999999",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
      ];
    }

    return Object.entries(moodCounts).map(([name, population]) => ({
      name,
      population,
      color: moodColors[name as keyof typeof moodColors] || "#999999",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const processLocationDistribution = () => {
    const locationCounts = drinks.reduce((acc, drink) => {
      if (drink.location) {
        acc[drink.location] = (acc[drink.location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Return default data if no locations are recorded
    if (Object.keys(locationCounts).length === 0) {
      return [
        {
          name: "No location data",
          population: 1,
          color: "#999999",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
      ];
    }

    return Object.entries(locationCounts).map(([name, population]) => ({
      name,
      population,
      color: locationColors[name as keyof typeof locationColors] || "#999999",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const processSpendingTrend = () => {
    const spendingByDay = drinks.reduce((acc, drink) => {
      const day = format(parseISO(drink.consumed_at), "EEE");
      acc[day] = (acc[day] || 0) + (drink.cost || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day) => Number(spendingByDay[day]?.toFixed(2)) || 0
          ),
        },
      ],
    };
  };

  const processAlcoholStrengthDistribution = () => {
    const strengthRanges = {
      "Light (0-4%)": 0,
      "Medium (4-8%)": 0,
      "Strong (8-12%)": 0,
      "Very Strong (12%+)": 0,
    };

    drinks.forEach((drink) => {
      if (drink.alcohol_percentage <= 4) strengthRanges["Light (0-4%)"]++;
      else if (drink.alcohol_percentage <= 8) strengthRanges["Medium (4-8%)"]++;
      else if (drink.alcohol_percentage <= 12)
        strengthRanges["Strong (8-12%)"]++;
      else strengthRanges["Very Strong (12%+)"]++;
    });

    return Object.entries(strengthRanges).map(([name, population]) => ({
      name,
      population,
      color: strengthColors[name as keyof typeof strengthColors],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const processVolumeOverTime = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, "MM-dd");
    }).reverse();

    const dailyVolumes = drinks.reduce((acc, drink) => {
      const day = format(parseISO(drink.consumed_at), "MM-dd");
      acc[day] = (acc[day] || 0) + drink.volume_ml;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: last7Days,
      datasets: [
        {
          data: last7Days.map((day) =>
            dailyVolumes[day] ? dailyVolumes[day] / 1000 : 0
          ), // Convert to liters
        },
      ],
    };
  };

  const processTopDrinks = () => {
    const drinkCounts = drinks.reduce((acc, drink) => {
      acc[drink.name] = (acc[drink.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDrinks = Object.entries(drinkCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: topDrinks.map(([name]) => name),
      datasets: [
        {
          data: topDrinks.map(([_, count]) => count),
        },
      ],
    };
  };

  const processHourlyDistribution = () => {
    const hourlyData = Array(24).fill(0);

    drinks.forEach((drink) => {
      const hour = getHours(parseISO(drink.consumed_at));
      hourlyData[hour]++;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          data: hourlyData,
        },
      ],
    };
  };

  const processDrinkingFrequency = () => {
    const today = new Date();
    const firstDrinkDate = new Date(
      Math.min(...drinks.map((d) => new Date(d.consumed_at).getTime()))
    );
    const totalDays = Math.ceil(
      (today.getTime() - firstDrinkDate.getTime()) / (1000 * 3600 * 24)
    );

    const drinkingDays = new Set(drinks.map((d) => d.consumed_at.split("T")[0]))
      .size;
    const nonDrinkingDays = totalDays - drinkingDays;
    const frequency = ((drinkingDays / totalDays) * 100).toFixed(1);

    return {
      drinkingDays,
      nonDrinkingDays,
      frequency,
    };
  };

  const processDrinkingMilestones = () => {
    // Most Active Day
    const drinksByDay = drinks.reduce((acc, drink) => {
      const date = drink.consumed_at.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveDayCount = Math.max(...Object.values(drinksByDay));
    const mostActiveDay = Object.entries(drinksByDay).find(
      ([_, count]) => count === mostActiveDayCount
    );

    // Streaks
    const sortedDates = [
      ...new Set(drinks.map((d) => d.consumed_at.split("T")[0])),
    ].sort();
    let currentStreak = 1;
    let longestStreak = 1;
    let currentBreak = 0;
    let longestBreak = 0;

    for (let i = 1; i < sortedDates.length; i++) {
      const date1 = new Date(sortedDates[i - 1]);
      const date2 = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
        currentBreak = diffDays - 1;
        longestBreak = Math.max(longestBreak, currentBreak);
      }
    }

    return {
      mostActiveDay: mostActiveDay
        ? {
            date: format(parseISO(mostActiveDay[0]), "MMM d, yyyy"),
            count: mostActiveDay[1],
          }
        : null,
      longestStreak,
      longestBreak,
    };
  };

  const processDrinkingSessions = () => {
    // Define a session as drinks within 4 hours of each other
    const SESSION_THRESHOLD = 4; // hours

    const sortedDrinks = [...drinks].sort(
      (a, b) =>
        new Date(a.consumed_at).getTime() - new Date(b.consumed_at).getTime()
    );

    let sessions: Array<Array<(typeof drinks)[0]>> = [];
    let currentSession: typeof drinks = [];

    sortedDrinks.forEach((drink, index) => {
      if (index === 0) {
        currentSession.push(drink);
        return;
      }

      const prevDrink = sortedDrinks[index - 1];
      const hoursDiff = differenceInHours(
        new Date(drink.consumed_at),
        new Date(prevDrink.consumed_at)
      );

      if (hoursDiff <= SESSION_THRESHOLD) {
        currentSession.push(drink);
      } else {
        sessions.push([...currentSession]);
        currentSession = [drink];
      }
    });

    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    const totalSessions = sessions.length;
    const avgDrinksPerSession = (drinks.length / totalSessions).toFixed(1);
    const avgAlcoholPerSession = (
      sessions.reduce((acc, session) => {
        const sessionAlcohol = session.reduce(
          (sum, drink) =>
            sum + ((drink.volume_ml * drink.alcohol_percentage) / 100) * 0.789,
          0
        );
        return acc + sessionAlcohol;
      }, 0) / totalSessions
    ).toFixed(1);

    return {
      totalSessions,
      avgDrinksPerSession,
      avgAlcoholPerSession,
    };
  };

  return (
    <View className="flex-1">
      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">Basic Stats</Text>
        {processBasicStats() && (
          <View className="flex-row flex-wrap justify-between mb-6">
            <StatBox
              label="Total Drinks"
              value={processBasicStats()?.totalDrinks.toString() ?? "0"}
            />
            <StatBox
              label="Most Frequent"
              value={processBasicStats()?.mostFrequentType ?? "N/A"}
            />
            <StatBox
              label="Avg Drinks/Day"
              value={processBasicStats()?.avgDrinksPerDay ?? "0"}
            />
          </View>
        )}
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Time of Day Pattern
        </Text>
        <PieChart
          data={processTimeOfDay()}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
          hasLegend={false}
        />
        <View className="mt-4 flex-row flex-wrap justify-between">
          {processTimeOfDay().map((item) => (
            <View
              key={item.name}
              className="w-[48%] flex-row items-center mb-2"
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text className="text-white text-sm flex-shrink">{`${item.name}: ${item.population}`}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="p-6 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-6 text-white">
          Drinking Patterns
        </Text>

        <View className="mb-8">
          <Text className="text-gray-400 text-sm mb-4 uppercase tracking-wider">
            Frequency
          </Text>
          <View className="flex-row justify-between mb-2">
            {(() => {
              const freq = processDrinkingFrequency();
              return (
                <>
                  <StatBox label="Drinking Days" value={freq.drinkingDays} />
                  <StatBox label="Sober Days" value={freq.nonDrinkingDays} />
                  <StatBox label="Frequency" value={freq.frequency} unit="%" />
                </>
              );
            })()}
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-gray-300 text-sm mb-4 uppercase tracking-wider">
            Milestones
          </Text>
          {(() => {
            const milestones = processDrinkingMilestones();
            return (
              <View className="space-y-4">
                <View className="bg-background/40 mb-4 rounded-lg p-4">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider">
                    Most Active
                  </Text>
                  <Text className="text-white text-lg mt-1">
                    {milestones.mostActiveDay?.date}
                  </Text>
                  <Text className="text-primary text-sm">
                    {milestones.mostActiveDay?.count} drinks
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <StatBox
                    label="Longest Streak"
                    value={milestones.longestStreak}
                    unit="days"
                  />
                  <StatBox
                    label="Longest Break"
                    value={milestones.longestBreak}
                    unit="days"
                  />
                </View>
              </View>
            );
          })()}
        </View>

        <View>
          <Text className="text-gray-300 text-sm mb-4 uppercase tracking-wider">
            Sessions
          </Text>
          {(() => {
            const sessions = processDrinkingSessions();
            return (
              <View className="bg-background/40 rounded-lg p-4">
                <View className="flex-row justify-between mb-4">
                  <StatBox
                    label="Total Sessions"
                    value={sessions.totalSessions}
                  />
                  <StatBox
                    label="Avg Drinks/Session"
                    value={sessions.avgDrinksPerSession}
                  />
                </View>
                <View className="bg-background/40 rounded-lg p-4">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Average Alcohol per Session
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-white text-2xl font-bold">
                      {sessions.avgAlcoholPerSession}
                    </Text>
                    <Text className="text-gray-400 text-sm ml-1">grams</Text>
                  </View>
                </View>
              </View>
            );
          })()}
        </View>
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Drinks by Type
        </Text>
        <PieChart
          data={processTypeData()}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
          hasLegend={false}
        />
        <View className="mt-4">
          {processTypeData().map((item) => (
            <View key={item.name} className="flex-row items-center mb-2">
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text className="text-white text-sm flex-shrink">{`${item.name}: ${item.population}`}</Text>
            </View>
          ))}
        </View>
      </View>
      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Alcohol Strength Distribution
        </Text>
        <PieChart
          data={processAlcoholStrengthDistribution()}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
          hasLegend={false}
        />
        <View className="mt-4 flex-row flex-wrap justify-between">
          {processAlcoholStrengthDistribution().map((item) => (
            <View
              key={item.name}
              className="w-[48%] flex-row items-center mb-2"
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text className="text-white text-sm flex-shrink">{`${item.name}: ${item.population}`}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Volume Consumed (Last 7 Days)
        </Text>
        <LineChart
          data={processVolumeOverTime()}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          yAxisLabel="L "
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
          }}
        />
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Top 5 Favorite Drinks
        </Text>
        <BarChart
          data={processTopDrinks()}
          width={screenWidth - 64}
          height={280}
          chartConfig={{
            ...chartConfig,
            propsForLabels: {
              ...chartConfig.propsForLabels,
              fontSize: 10,
            },
          }}
          verticalLabelRotation={45}
          yAxisLabel=""
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
          }}
          yAxisSuffix=""
          fromZero
          showValuesOnTopOfBars
        />
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          24-Hour Distribution
        </Text>
        <LineChart
          data={processHourlyDistribution()}
          width={screenWidth - 64}
          height={280}
          chartConfig={{
            ...chartConfig,
            propsForLabels: {
              ...chartConfig.propsForLabels,
              fontSize: 10,
            },
          }}
          bezier
          verticalLabelRotation={90}
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
            paddingBottom: 20,
          }}
        />
      </View>
      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Weekly Pattern
        </Text>
        <BarChart
          data={processWeeklyData()}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          yAxisLabel=""
          yAxisSuffix="%"
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
          }}
        />
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">Monthly Trend</Text>
        <BarChart
          data={processMonthlyTrend()}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          yAxisLabel=""
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
          }}
        />
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Mood Distribution
        </Text>
        <PieChart
          data={processMoodDistribution()}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
          hasLegend={false}
        />
        <View className="mt-4">
          {processMoodDistribution().map((item) => (
            <View key={item.name} className="flex-row items-center mb-2">
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text className="text-white">{`${item.name}: ${item.population}`}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Location Distribution
        </Text>
        <PieChart
          data={processLocationDistribution()}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
          hasLegend={false}
        />
        <View className="mt-4">
          {processLocationDistribution().map((item) => (
            <View key={item.name} className="flex-row items-center mb-2">
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: 6,
                  marginRight: 8,
                }}
              />
              <Text className="text-white">{`${item.name}: ${item.population}`}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="p-4 bg-secondary rounded-xl shadow-lg mt-4">
        <Text className="text-xl font-bold mb-4 text-white">
          Weekly Spending
        </Text>
        <BarChart
          data={processSpendingTrend()}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          yAxisLabel="$"
          style={{
            borderRadius: 16,
            marginVertical: 8,
            paddingRight: 0,
          }}
        />
      </View>

      <Footer />
    </View>
  );
};

export default OwnAnalytics;
