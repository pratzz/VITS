#include<p18f4550.h>
#pragma config FOSC=HS
#pragma config PWRT=OFF
#pragma config WDT=OFF
#pragma config DEBUG=OFF, LVP=OFF

#define PIC_CLK 20000000

#define RS PORTDbits.RD2
#define EN PORTDbits.RD3

#define D4 PORTDbits.RD4
#define D5 PORTDbits.RD5
#define D6 PORTDbits.RD6
#define D7 PORTDbits.RD7

#define INPUT 1		//port directions, ie: TRISA0=INPUT;
#define OUTPUT 0
#define TRUE 1
#define FALSE 0
#define true 1
#define false 0
#define	HIGH 1
#define	LOW 0
#define	hi 1
#define	lo 0


void serial_set(void);
void delay (unsigned int itime);
unsigned char getch(void);
void Lcd_Write_String(unsigned char *a);
void Lcd_Port(char a);
void Lcd_Cmd(char a);
Lcd_Clear();
void Lcd_Set_Cursor(char a, char b);
void Lcd_Init();
void Lcd_Write_Char(char a);
void putch(unsigned char c);


void main(void)
{
  unsigned char SData[12],s;
  int i=0;
  TRISD = 0x00;
  ADCON1=0X0A;
  TRISE=0X00;

  Lcd_Init();
  serial_set();

  Lcd_Clear();
  Lcd_Set_Cursor(1,1);
  Lcd_Write_String("receive :");
  Lcd_Set_Cursor(2,1);
  s = getch();
  Lcd_Write_Char(s);
  //putch('a');


  for(;;);
}

unsigned char getch(void)
{
    while(!PIR1bits.RCIF);

    return RCREG;
}

void putch(unsigned char c)
{
	while(PIR1bits.TXIF == 0)			//set when register is empty
	{
		TXREG=0x41;
	}

        while(PIR1bits.TX1IF == 0)
	 TXREG=c;
}

void serial_set(void)
{
    SPBRG=31;
    TXSTAbits.BRGH=1;
    TXSTAbits.BRGH1=0;
    TXSTAbits.SYNC=0;
    						//asynchronous
    RCSTAbits.SPEN=1;						//enable serial port pins
    RCSTAbits.CREN=1;						//enable reception
   						//no effect
    PIE1bits.TXIE=0;						//disable tx interrupts
    PIE1bits.RCIE=0;						//disable rx interrupts
    TXSTAbits.TX9=0;						//8-bit transmission
    RCSTAbits.RX9=0;						//8-bit reception
    TXSTAbits.TXEN=0;						//reset transmitter
    TXSTAbits.TXEN=1;


}

void delay(unsigned int itime)
{
 int xx,yy;
 for(xx=0;xx<=itime;xx++)
  for(yy=0;yy<=1275;yy++);
}

void Lcd_Port(char a)
{
	if(a & 1)
		D4 = 1;
	else
		D4 = 0;

	if(a & 2)
		D5 = 1;
	else
		D5 = 0;

	if(a & 4)
		D6 = 1;
	else
		D6 = 0;

	if(a & 8)
		D7 = 1;
	else
		D7 = 0;
}

void Lcd_Cmd(char a)
{
	RS = 0;             // => RS = 0
	Lcd_Port(a);
	EN  = 1;             // => E = 1
        delay(4);
        EN  = 0;             // => E = 0
}

Lcd_Clear()
{
	Lcd_Cmd(0);
	Lcd_Cmd(1);
}

void Lcd_Set_Cursor(char a, char b)
{
	char temp,z,y;
	if(a == 1)
	{
	  temp = 0x80 + b - 1;
		z = temp>>4;
		y = temp & 0x0F;
		Lcd_Cmd(z);
		Lcd_Cmd(y);
	}
	else if(a == 2)
	{
		temp = 0xC0 + b - 1;
		z = temp>>4;
		y = temp & 0x0F;
		Lcd_Cmd(z);
		Lcd_Cmd(y);
	}
}

void Lcd_Init()
{
  Lcd_Port(0x00);
  delay(20);
  Lcd_Cmd(0x03);
  delay(5);
  Lcd_Cmd(0x03);
  delay(11);
  Lcd_Cmd(0x03);
  Lcd_Cmd(0x02);
  Lcd_Cmd(0x02);
  Lcd_Cmd(0x08);
  Lcd_Cmd(0x00);
  Lcd_Cmd(0x0C);
  Lcd_Cmd(0x00);
  Lcd_Cmd(0x06);
}

void Lcd_Write_Char(char a)
{
   char temp,y;
   temp = a&0x0F;
   y = a&0xF0;
   RS = 1;             // => RS = 1
   Lcd_Port(y>>4);             //Data transfer
   EN = 1;
   delay(10);
   EN = 0;
   Lcd_Port(temp);
   EN = 1;
   delay(10);
   EN = 0;
}

void Lcd_Write_String(unsigned char *a)
{
	int i;
	for(i=0;a[i]!='\0';i++)
	   Lcd_Write_Char(a[i]);
}

