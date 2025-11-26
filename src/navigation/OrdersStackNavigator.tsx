import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"

// IMPORT SCREENS
import { OrdersScreen } from "@/features/orders/screens/OrdersScreen"

// ==============================================
// ORDERS STACK PARAM LIST
// ==============================================
export type OrdersStackParamList = {
  OrdersMain: undefined
  OrderDetail: {
    orderId: string
  }
  CheckoutSuccess: {
    orderId?: string
  }
 
}

const Stack = createNativeStackNavigator<OrdersStackParamList>()

export function OrdersStackNavigator() {
  return (
    <Stack.Navigator
      
    >
      {/* LIST ORDER */}
      <Stack.Screen
        name="OrdersMain"
        component={OrdersScreen}
        options={{
    headerShown: false, 
  }}
      />

      {/* ORDER DETAIL */}
     
    </Stack.Navigator>
  )
}
