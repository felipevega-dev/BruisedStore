"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Qué materiales utilizas para las obras?",
      answer: "Trabajo principalmente con pintura acrílica sobre lienzo de alta calidad. El acrílico permite colores vibrantes, durabilidad excepcional y acabados profesionales. También puedo trabajar con óleo si lo prefieres, aunque el tiempo de entrega será mayor.",
    },
    {
      question: "¿Cuánto tiempo tarda en hacerse mi obra?",
      answer: "El tiempo varía según el tamaño: obras pequeñas (20x25 a 40x50 cm) tardan 7-14 días, medianas (60x80 a 100x80 cm) entre 14-21 días, y grandes (120x100 a 180x140 cm) entre 21-30 días. Esto incluye tiempo de secado y acabado profesional.",
    },
    {
      question: "¿Puedo ver el progreso de mi obra?",
      answer: "¡Absolutamente! Te enviaré fotos del proceso en etapas clave: boceto inicial, primera capa de pintura, detalles intermedios y obra finalizada. Valoro tu feedback y podemos hacer ajustes menores durante el proceso.",
    },
    {
      question: "¿Qué pasa si no me gusta el resultado?",
      answer: "Antes del envío final, te muestro fotos de la obra terminada. Si algo no te convence, haré ajustes sin costo adicional. Tu satisfacción es mi prioridad. Solo procedo al envío cuando estés 100% feliz con el resultado.",
    },
    {
      question: "¿Trabajas con fotos de baja calidad?",
      answer: "Sí, puedo trabajar con fotos de calidad media o baja, pero el resultado será una interpretación artística más que una reproducción exacta. Para retratos realistas, recomiendo fotos de buena resolución. Para estilos más libres o abstractos, la calidad de la foto es menos crítica.",
    },
    {
      question: "¿Puedo combinar varias fotos en una sola obra?",
      answer: "¡Claro! Puedo crear composiciones con varias fotos: retratos familiares, collages de mascotas, paisajes combinados, etc. Solo indícalo en las notas adicionales y sube todas las imágenes que necesites. El precio puede variar según la complejidad.",
    },
    {
      question: "¿Haces obras de mascotas? ¿Paisajes? ¿Abstracto?",
      answer: "Sí a todo. Trabajo con retratos de personas, mascotas, paisajes, naturaleza muerta, composiciones abstractas y estilos experimentales. Revisa la galería principal para ver la variedad de estilos que manejo.",
    },
    {
      question: "¿Cómo es el proceso de pago?",
      answer: "Después de confirmar tu pedido, te contacto para acordar el pago. Acepto transferencia bancaria o efectivo. Generalmente pido un 50% de adelanto para comprar materiales y comenzar, y el 50% restante al finalizar, antes del envío.",
    },
    {
      question: "¿El precio incluye envío?",
      answer: "El precio mostrado es solo por la obra. El envío se calcula según tu ubicación y el tamaño del lienzo. Envíos a Santiago suelen costar entre $3.000-$8.000. Regiones entre $5.000-$15.000. También puedes retirar gratis en el taller.",
    },
    {
      question: "¿Puedo solicitar cambios una vez iniciada la obra?",
      answer: "Cambios menores (colores, detalles pequeños) son bienvenidos durante el proceso. Cambios mayores (composición completa, estilo diferente) pueden tener costo adicional según el avance. Por eso es importante que seas claro con tu visión desde el inicio.",
    },
    {
      question: "¿Entregas algún certificado de autenticidad?",
      answer: "Sí, cada obra viene firmada al reverso con fecha de creación. Si lo solicitas, también incluyo un certificado de autenticidad digital con foto de la obra, materiales usados y tus datos como propietario.",
    },
    {
      question: "¿Qué pasa si la obra se daña en el envío?",
      answer: "Embalo cada obra con protección profesional (plástico burbuja, cartón reforzado, esquineros). Si llegara a dañarse, tomo fotos del embalaje y coordino con el courier. Tengo seguro para envíos de alto valor. Tu inversión está protegida.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden border-4 border-black bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
      {/* Decorative elements */}
      <div className="absolute -left-20 top-1/4 h-60 w-60 rounded-full bg-blue-200/20 blur-3xl"></div>
      <div className="absolute -right-20 bottom-1/4 h-60 w-60 rounded-full bg-pink-200/20 blur-3xl"></div>

      <div className="relative mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-purple-500 bg-purple-100">
            <HelpCircle className="h-6 w-6 text-purple-700" />
          </div>
          <h2 className="text-2xl font-black text-black sm:text-3xl">
            Preguntas Frecuentes
          </h2>
        </div>
        <div className="mx-auto h-2 w-20 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <p className="mt-4 text-base font-bold text-gray-800">
          Todo lo que necesitas saber antes de hacer tu pedido
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-4 border-black bg-white transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex w-full items-start justify-between gap-4 p-4 text-left transition-colors hover:bg-moss-50 sm:p-5"
            >
              <span className="flex-1 text-base font-black text-black sm:text-lg">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-6 w-6 shrink-0 text-purple-600 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="border-t-4 border-black bg-moss-50 p-4 sm:p-5">
                <p className="text-sm leading-relaxed text-gray-800 sm:text-base">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="relative mt-6 overflow-hidden border-t-4 border-black bg-linear-to-r from-green-500 to-emerald-600 p-5 text-center sm:p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative">
          <p className="mb-3 text-base font-bold text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] sm:text-lg">
            ¿Tienes otra pregunta?
          </p>
          <p className="mb-4 text-sm font-semibold text-green-50">
            Escríbeme por WhatsApp y te respondo en minutos ⚡
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(
              "Hola! Tengo una pregunta sobre las obras a pedido..."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border-4 border-white bg-white px-6 py-3 font-black text-green-600 transition-all hover:bg-green-50 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:scale-105"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
