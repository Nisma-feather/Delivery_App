import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../api/apiConfig'
import { useAuth } from '../context/AuthContext'
import { Text } from 'react-native'

const MyOrders = () => {
  const {auth} = useAuth();
  const fetchOrders= async()=>{
    try{
    const res = await api.get(`/order/${auth.userId}`)
    console.log(res.data)
    }
    catch(e){
      console.log(e)
    }
  }
  useEffect(()=>{
    fetchOrders()
  },[])

  return (
    <SafeAreaView>
        <Text>My Orders</Text>
    </SafeAreaView>
  )
}

export default MyOrders