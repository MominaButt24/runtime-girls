import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Dropdown({ options, selectedValue, onValueChange, placeholder, theme }) {
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.optionContainer} 
        onPress={() => {
            onValueChange(item);
            setModalVisible(false);
        }}
    >
        <Text style={{color: theme.onSurface}}>{item.label || item}</Text>
        {item.icon && <MaterialCommunityIcons name={item.icon} size={20} color={theme.onSurfaceVariant} />}
    </TouchableOpacity>
  );

  return (
    <View>
        <TouchableOpacity style={[styles.dropdown, {borderColor: theme.outline}]} onPress={() => setModalVisible(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {selectedValue && selectedValue.icon && <MaterialCommunityIcons name={selectedValue.icon} size={20} color={theme.onSurfaceVariant} style={{marginRight: 10}} />}
                <Text style={{color: selectedValue ? theme.onSurface : theme.onSurfaceVariant}}>{selectedValue ? (selectedValue.label || selectedValue) : placeholder}</Text>
            </View>
            <Ionicons name="chevron-down-outline" size={24} color={theme.onSurfaceVariant} />
        </TouchableOpacity>
        <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
            <View style={[styles.modalContent, {backgroundColor: theme.surface}]}>
                <FlatList
                    data={options}
                    renderItem={renderItem}
                    keyExtractor={(item) => typeof item === 'string' ? item : item.value || item.label}
                />
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%'
    },
    optionContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});