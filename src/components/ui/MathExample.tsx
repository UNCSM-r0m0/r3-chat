import React from 'react';
import { MathMarkdown } from './MathMarkdown';

export const MathExample: React.FC = () => {
  const mathContent = `
# Ejemplo de Fórmulas Matemáticas

## Integrales

La integral definida de una función f(x) desde a hasta b se define como:

$$\\int_a^b f(x) dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i) \\Delta x$$

Donde $\\Delta x = \\frac{b-a}{n}$ y $x_i = a + i\\Delta x$.

## Ecuaciones Diferenciales

Una ecuación diferencial ordinaria de primer orden tiene la forma:

$$\\frac{dy}{dx} = f(x, y)$$

## Física - Movimiento Armónico Simple

La ecuación del movimiento armónico simple es:

$$x(t) = A \\cos(\\omega t + \\phi)$$

Donde:
- $A$ es la amplitud
- $\\omega$ es la frecuencia angular
- $\\phi$ es la fase inicial

## Cálculo Vectorial

El gradiente de una función escalar $f(x,y,z)$ es:

$$\\nabla f = \\frac{\\partial f}{\\partial x}\\hat{i} + \\frac{\\partial f}{\\partial y}\\hat{j} + \\frac{\\partial f}{\\partial z}\\hat{k}$$

## Álgebra Lineal

El determinante de una matriz 2x2:

$$\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$$

## Estadística

La distribución normal estándar tiene la función de densidad:

$$f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}$$

## Código Python para calcular integrales

\`\`\`python
import numpy as np
from scipy import integrate

def f(x):
    return x**2

# Integrar x^2 de 0 a 1
result, error = integrate.quad(f, 0, 1)
print(f"Integral: {result}")
print(f"Error: {error}")
\`\`\`

## Fórmulas en línea

La derivada de $x^2$ es $2x$, y la integral de $2x$ es $x^2 + C$.

La ecuación de Einstein $E = mc^2$ relaciona masa y energía.
`;

  return (
    <div className="p-6 bg-gray-900 text-white">
      <MathMarkdown content={mathContent} />
    </div>
  );
};
