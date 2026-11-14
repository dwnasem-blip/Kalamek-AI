import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tools = [
  {
    id: 'writer',
    title: 'كاتب النصوص',
    description: 'اكتب مقالات احترافية بمساعدة الذكاء الاصطناعي',
    icon: 'pencil',
  },
  {
    id: 'summarizer',
    title: 'ملخص النصوص',
    description: 'لخص النصوص الطويلة في ثوان',
    icon: 'text-box-outline',
  },
  {
    id: 'rewriter',
    title: 'إعادة الصياغة',
    description: 'أعد صياغة النصوص بأساليب مختلفة',
    icon: 'pencil-box',
  },
  {
    id: 'social',
    title: 'محتوى السوشيال ميديا',
    description: 'انشر محتوى جذاب على وسائل التواصل',
    icon: 'share-social',
  },
  {
    id: 'video',
    title: 'استوديو الفيديو',
    description: 'حول النصوص إلى فيديوهات متحركة',
    icon: 'movie',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>مرحباً بك في WRITEGO</Text>
        <Text style={styles.subGreeting}>اختر الأداة التي تريد استخدامها</Text>
      </View>

      <View style={styles.toolsContainer}>
        {tools.map((tool) => (
          <TouchableOpacity key={tool.id} style={styles.toolCard}>
            <View style={styles.toolIconContainer}>
              <MaterialCommunityIcons name={tool.icon as any} size={32} color="#2563eb" />
            </View>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.creditsCard}>
        <Text style={styles.creditsTitle}>أرصدتك</Text>
        <Text style={styles.creditsAmount}>500 رصيد متبقي</Text>
        <Text style={styles.creditsSubtext}>الترقية للحصول على أرصدة إضافية</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  toolsContainer: {
    gap: 12,
  },
  toolCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  toolIconContainer: {
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  toolDescription: {
    fontSize: 12,
    color: '#666',
  },
  creditsCard: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 20,
    marginVertical: 24,
    marginBottom: 40,
  },
  creditsTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  creditsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  creditsSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
});
