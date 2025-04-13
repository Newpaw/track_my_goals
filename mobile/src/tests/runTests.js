import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import apiConfigTest from './apiConfigTest';

const TestRunner = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    // Override console.log to capture test output
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      setTestResults(prev => [...prev, args.join(' ')]);
      originalConsoleLog(...args);
    };

    // Run tests
    const runAllTests = async () => {
      try {
        await apiConfigTest();
      } catch (error) {
        console.log(`Error running tests: ${error.message}`);
      } finally {
        setIsRunning(false);
        // Restore console.log
        console.log = originalConsoleLog;
      }
    };

    runAllTests();

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>API Configuration Tests</Text>
      {isRunning && <Text style={styles.running}>Running tests...</Text>}
      <ScrollView style={styles.results}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultLine}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  running: {
    color: 'blue',
    marginBottom: 10,
  },
  results: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  resultLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default TestRunner;