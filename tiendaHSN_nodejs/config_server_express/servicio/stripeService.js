//modulo de codigo q exporta un objeto javascript con metodos para hacer peticiones a la api de stripe
//para configurar el pago con tarjeta de credito

// class StripeService {
//     constructor() {}
//     async CrearClienteStripe(email,nombre,apellidos){} 
//     async CrearMetodoPagoStripe(tipoTarjeta,numeroTarjeta,mesExpiracion,anioExpiracion,cvc){}
//     async CrearCargoStripe(cantidad,moneda,descripcion,clienteId){}
// }

// const miservicio=new StripeService();
// module.exports=miservicio;

const BASE_URL_STRIPE = 'https://api.stripe.com/v1';

module.exports = {
    Stage1_CreateCustomer: async (email, nombre, apellidos, direccionEnvio) => {
        try {
            //1º paso pago por tarjeta en stripe crear cliente (objeto CUSTOMER) EN STRIPE
            //https://docs.stripe.com/api/customers/create?lang=curl
            //!OJO!!!! EN EL BODY DE LA PETICION NO PUEDE IR UN OBJETO JSON!!! sino UN FORMATO x-www-form-urlencoded
            //para lo cual usamos el objeto URLSearchParams de javascript
            const body={
                name: `${nombre} ${apellidos}`,
                email,
                'address[line1]': direccionEnvio.calle,
                'address[city]': direccionEnvio.municipio,
                'address[state]': direccionEnvio.provincia,
                'address[country]': direccionEnvio.pais,
                'address[postal_code]': direccionEnvio.cp
            }

            const petCreateCustomer = await fetch(`${BASE_URL_STRIPE}/customers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(body) //variable=valor&variable=valor&.... ==> name=`${nombre} ${apellidos}`&email=`${email}`&....
            });
            //OJO!!!! en la api de stripe dicen q devuelven status 2xx en caso de exito, 4xx en caso de error, 5xx en caso de caida de servers stripe
            //if(petCreateCustomer.status!==200) throw new Error(`Error en peticion crear customer en stripe, status ${petCreateCustomer.status}`);
            if(! /2\d{2}/.test(petCreateCustomer.status.toString())) throw new Error(`Error en peticion crear customer en stripe, status ${petCreateCustomer.status}`);
            const datosCustomerStripe=await petCreateCustomer.json();
            console.log('Datos Customer Stripe:', datosCustomerStripe);

            //solo devolvemos el ID del customer creado en stripe
            return datosCustomerStripe.id; //<---- este dato se alamacerara en la tabla de CLIENTES en nuestra BBDD en prop. metodoPago: [ { tipo: 'Tarjeta credito', detalles:{ idCustomerStripe: 'cus_xxx', idCard: '...' } } ]

        } catch (error) {
            console.log('Error en Stage1_CreateCustomer:', error);
            return null;
        }
    },
    Stage2_CreateCardForCustome: async (idCustomer, datosTarjeta) => {
        try {
            //2º paso pago por tarjeta en stripe crear metodo de pago (objeto CARD) EN STRIPE
            //usando el ID DEL CUSTOMER CREADO EN EL PASO ANTERIOR
            //https://docs.stripe.com/api/cards/create?lang=curl
            const datosCard={
                'source': 'visa', //<----- en produccion se ponen datos reales de la tarjeta del cliente, en desarrollo usamos 'visa' como tarjeta virtual para poder hacer cobros virtuales
                // 'card[number]': datosTarjeta.numero,
                // 'card[exp_month]': datosTarjeta.mes,
                // 'card[exp_year]': datosTarjeta.anio,
                // 'card[cvc]': datosTarjeta.cvc
            }

            const petCreateCard = await fetch(`${BASE_URL_STRIPE}/customers/${idCustomer}/sources`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                 },
                body: new URLSearchParams( datosCard) 
            });
            //OJO!!!! en la api de stripe dicen q devuelven status 2xx en caso de exito, 4xx en caso de error, 5xx en caso de caida de servers stripe
            if(! /2\d{2}/.test(petCreateCard.status.toString())) throw new Error(`Error en peticion crear card en stripe, status ${petCreateCard.status}`);
            
            const datosCardStripe=await petCreateCard.json(); //<---- objeto CARD de Stripe asociado al id CUSTOMER creado en paso anterior
            console.log('Datos Card Stripe:', datosCardStripe);
            //solo devolvemos el ID de la CARD creada en stripe
            return datosCardStripe.id; //<---- este dato se alamacerara en la tabla de CLIENTES en nuestra BBDD en prop. metodoPago: [ { tipo: 'Tarjeta credito', detalles:{ idCustomerStripe: 'cus_xxx', idCard: 'card_xxx' } } ]
        
        } catch (error) {
            console.log('Error en Stage2_CreateCardForCustome:', error);
            return null;
        }
    },
    Stage3_CreateCharge: async (idCustomer, idCard, cantidad, idPedido)=>{
        try {
            //3º paso pago por tarjeta en stripe crear cargo (objeto CHARGE) EN STRIPE
            //usando el ID DEL CUSTOMER CREADO EN EL PASO 1 y el ID DE LA CARD CREADA EN EL PASO 2
            //!OJO!!!! el endpoint de Create Charges: https://docs.stripe.com/api/charges/create?lang=curl !!!deprecated!!!
            // ahora se recomienda usar Payment Intents: https://docs.stripe.com/api/payment_intents/create?lang=curl
            const bodyPaymentIntent={
                'amount': Math.round(cantidad*100),
                'currency': 'eur',
                'customer': idCustomer,
                'payment_method': idCard,
                'description': `Pago pedido Tienda HSN - ID Pedido: ${idPedido}`,
                'confirm': 'true', //<---------------------------  no pide confirmacion al crear el payment intent, lo confirma directamente
                'automatic_payment_methods[enabled]': true, //<--- habilitas para el pago en stripe metodos descritos en tu dashboard
                'automatic_payment_methods[allow_redirects]': 'never' //<-- para evitar redirecciones en el flujo de pago al cliente para pedir confirmacion
            }
            
            const petPaymentIntent = await fetch(`${BASE_URL_STRIPE}/payment_intents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                 },
                body: new URLSearchParams(bodyPaymentIntent)
            });

            //OJO!!!! en la api de stripe dicen q devuelven status 2xx en caso de exito, 4xx en caso de error, 5xx en caso de caida de servers stripe
            if(! /2\d{2}/.test(petPaymentIntent.status.toString())) throw new Error(`Error en peticion crear payment intent en stripe, status ${petPaymentIntent.status}`);

            const datosPaymentIntent=await petPaymentIntent.json(); //<---- objeto PAYMENT INTENT de Stripe
            console.log('Datos Payment Intent:', datosPaymentIntent);
            //solo devolvemos el ID de la PAYMENT INTENT creada en stripe
            return datosPaymentIntent.id; //<---- este dato se alamacerara en la tabla de PEDIDOS en nuestra BBDD en prop. idPaymentIntent: 'pi_xxx'




        } catch (error) {
            
        }
    }
}