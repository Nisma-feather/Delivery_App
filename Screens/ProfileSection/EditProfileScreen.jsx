import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/apiConfig';
import Color from '../../constants/Color';

const EditProfileScreen = ({ navigation, route }) => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    userName: '',
    mobile: '',
 
  });

  // Form state
  const [formData, setFormData] = useState({
    userName: '',
    mobile: '',
  });

  // Validation state
  const [errors, setErrors] = useState({
    userName: '',
    mobile: '',
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if(!auth?.userId){
         return
      }
      const response = await api.get(`/user/${auth.userId}`); // Or your specific endpoint
      console.log(response.data?.user)
      
        const data = response.data.user;
        
        setUserData({
          userName: data.userName || '',
          mobile: data.mobile || '',
          email: data.email || '',
        });
        setFormData({
          userName: data.userName || '',
          mobile: data.mobile || '',
        });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { userName: '', mobile: '' };

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
      valid = false;
    } else if (formData.userName.trim().length < 2) {
      newErrors.userName = 'Username must be at least 2 characters';
      valid = false;
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      valid = false;
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle update profile
  const handleUpdateProfile = async () => {
    if (!validateForm() || !auth?.userId) {
      return;
    }

    try {
      setSaving(true);
      
      // Prepare update data
      const updateData = {
        userName: formData.userName.trim(),
        mobile: formData.mobile.trim(),
      };

      console.log('Updating profile with:', updateData);

      // API call to update user profile
      const response = await api.put(`/user/profile/${auth.userId}`, updateData);
      

        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Update local user data
                setUserData(prev => ({
                  ...prev,
                  userName: formData.userName,
                  mobile: formData.mobile
                }));
                // Navigate back or show success
                navigation.goBack();
              }
            }
          ]
        );
     
    } catch (error) {
      console.error('Error updating profile:', error);
     
    } finally {
      setSaving(false);
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    return formData.userName !== userData.userName || 
           formData.mobile !== userData.mobile;
  };

  // Handle back with confirmation if unsaved changes
  const handleBack = () => {
    if (hasChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.DARK} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={[styles.input, errors.userName && styles.inputError]}
              value={formData.userName}
              onChangeText={(text) => handleInputChange('userName', text)}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              autoCapitalize="words"
              maxLength={50}
            />
            {errors.userName ? (
              <Text style={styles.errorText}>{errors.userName}</Text>
            ) : null}
          </View>

          {/* Email Field (Read-only) */}
        

          {/* Mobile Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={[styles.input, errors.mobile && styles.inputError]}
              value={formData.mobile}
              onChangeText={(text) => handleInputChange('mobile', text)}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.mobile ? (
              <Text style={styles.errorText}>{errors.mobile}</Text>
            ) : null}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            (!hasChanges() || saving) && styles.updateButtonDisabled
          ]}
          onPress={handleUpdateProfile}
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.updateButtonText}>Update Profile</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Note Section */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={18} color="#666" />
          <Text style={styles.noteText}>
            Your profile information will be updated across all services.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
   
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#D9534F',
    backgroundColor: '#FFF8F8',
  },
  readOnlyField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readOnlyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#D9534F',
    marginTop: 4,
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: Color.DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: Color.DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: 'transparent',
  },
  updateButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1E9FF',
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default EditProfileScreen;