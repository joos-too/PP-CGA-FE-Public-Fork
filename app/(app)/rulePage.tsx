import React from 'react';
import {Text} from 'react-native-paper';
import {landingpage, rulePageStyles, styles} from '@/constants/Styles';
import {CenteredView} from '@/components/ThemedComponents';
import {ScrollView, View} from 'react-native';
import Collapsible from '@/components/Collapsible';

export default function HomeScreen() {
    return (
        <CenteredView
            style={landingpage.homeView}
        >
            <View style={rulePageStyles.topContainer}>
                <ScrollView style={rulePageStyles.scrollList}>

                    <Collapsible title="Allgemein">
                        <Text style={styles.text}>
                            Zunächst muss ein Spieler einen Raum erstellen. Dieser Raum erhält eine Raum-ID, die an
                            andere Spieler weitergegeben werden kann. Mit dieser ID können andere Spieler dem Spiel
                            beitreten und gemeinsam die Partie spielen!
                        </Text>
                    </Collapsible>
                    <Collapsible title="MauMau">
                        <Text style={styles.text}>
                            Das Ziel bei Mau Mau ist es, alle eigenen Karten loszuwerden. Man legt Karten ab, die
                            entweder die gleiche Farbe oder den gleichen Wert wie die oberste Karte auf dem Ablagestapel
                            haben.{'\n'}
                            Wenn man keine passende Karte hat, muss man eine Karte nachziehen.{'\n'}{'\n'}
                            - Wird eine <Text style={styles.textBold}>7</Text> gelegt, muss der nächsten Spieler 2
                            Karten nachziehen, sollte dieser jedoch ebenfalls eine 7 besitzen, so kann er anstatt
                            2 Karten zu ziehen, seine 7 legen. Dadurch muss der nächste Spieler nun 4 Karten ziehen.
                            Bei weiteren 7en geht es entsprechend weiter.{'\n'}
                            - Eine <Text style={styles.textBold}>8</Text> zwingt den nächsten Spieler auszusetzen.{'\n'}
                            - Ein <Text style={styles.textBold}>Bube (J)</Text> ermöglicht es die Farbe zu
                            wechseln.{'\n'}{'\n'}
                            Wer seine vorletzte Karte ablegt, muss zuvor "Mau" sagen, um mit dem Legen der Karte
                            anzukündigen, dass man seine letzte Karte erreicht hat. Sagt man nicht "Mau", muss man eine
                            Karte nachziehen.
                        </Text>
                    </Collapsible>
                    <Collapsible title="Lügen">
                        <Text style={styles.text}>
                            Das Ziel bei Lügen ist es, alle Karten loszuwerden, indem man diese an den nächsten Spieler
                            weitergibt. Man legt <Text style={styles.textBold}>1-3</Text> Karten verdeckt ab und gibt
                            an, welche Karten man gelegt hat, ohne dass dies der Wahrheit entsprechen muss. Wird mit
                            einem doppelten Kartendeck gespielt, können bis zu <Text
                            style={styles.textBold}>7</Text> Karten auf einmal gelegt werden.{'\n'}
                            Vermutet ein Spieler, dass der vorherige Spieler gelogen hat, kann er die zuletzt
                            abgelegten Karten aufdecken und ansehen, was der vorherige Spieler gelegt hat.{'\n'}{'\n'}
                            - Hat der Ankläger recht, muss der Lügner alle Karten aufnehmen,{'\n'}
                            - Lag er falsch muss der Ankläger die Karten aufnehmen.{'\n'}{'\n'}
                            Hat ein Spieler 4 bzw 8 gleiche Karten (je nach Deckgröße), so werden diese aus dem Spiel
                            genommen, sind es jedoch <Text style={styles.textBold}>Asse (A)</Text> ist das Spiel sofort
                            zu ende und der Spieler hat verloren.{'\n'}
                            Außerdem dürfen <Text style={styles.textBold}>Asse (A)</Text> nicht angeben werden, sondern
                            müssen immer geschummelt werden.{'\n'}{'\n'}
                            <Text style={styles.textBold}>Wichtig!</Text> Beide Regeln für <Text
                            style={styles.textBold}>Asse (A)</Text> sind im alternativen Spielmodus
                            nicht präsent.{'\n'}{'\n'}
                            Sollte ein Spieler das Spiel verlassen, so werden seine Karten gleichmäßig unter den
                            verbleibenden Spielern aufgeteilt.
                        </Text>
                    </Collapsible>

                </ScrollView>
            </View>
        </CenteredView>
    );
}
