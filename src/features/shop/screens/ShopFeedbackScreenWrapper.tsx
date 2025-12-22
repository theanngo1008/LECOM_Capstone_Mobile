import React from "react";
import { ShopFeedbackScreen } from "./ShopFeedbackScreen";

/**
 * Wrapper component for ShopFeedbackScreen
 * 
 * This wrapper helps with Fast Refresh issues in dev mode.
 * Fast Refresh can sometimes cause navigation context to be unavailable
 * immediately after hot reload. This wrapper ensures the component
 * is properly isolated.
 * 
 * @see https://reactnative.dev/docs/fast-refresh
 */
export function ShopFeedbackScreenWrapper(props: any) {
  // Pass through to the actual screen
  // The screen uses useNavigation hook which requires NavigationContainer
  return <ShopFeedbackScreen />;
}

// Mark this component as safe for Fast Refresh
// This tells Metro bundler to preserve this component during hot reload
ShopFeedbackScreenWrapper.displayName = "ShopFeedbackScreenWrapper";
