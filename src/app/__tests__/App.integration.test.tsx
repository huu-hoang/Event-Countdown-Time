import React from 'react';
import { render, act, RenderResult } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../(tabs)/index';

// Mock Animated API
jest.mock('react-native-reanimated/mock');

const Tab = createBottomTabNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  </NavigationContainer>
);

describe('HomeScreen', () => {
  let component: RenderResult;

  beforeEach(() => {
    component = render(<TestNavigator />);
  });

  afterEach(() => {
    component.unmount();
  });

  test('renders main screen', async () => {
    const { findByText } = component;
    await act(async () => {
      expect(await findByText('Upcoming Events')).toBeTruthy();
    });
  });
});
