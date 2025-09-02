---CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO public."Rols" (id, rol, status) VALUES 
  (gen_random_uuid(), 'SuperAdministrador', true),
  (gen_random_uuid(), 'Administrador', true),
  (gen_random_uuid(), 'Vendedor', true),
  (gen_random_uuid(), 'Tutor', true),
  (gen_random_uuid(), 'Salón', true),
  (gen_random_uuid(), 'Punto de venta', true),
  (gen_random_uuid(), 'Raso', true),
  (gen_random_uuid(), 'Graduado', true);

INSERT INTO public."User_Types"(id, usertype, status) VALUES
	(gen_random_uuid(), 'Natural', true),
  (gen_random_uuid(), 'Juridica', true);

  // EJERCICIOS DE MATCH Y OPTION EN RUST
// ====================================

// 1. BÁSICO: VERIFICAR SI HAY VALOR
// Objetivo: Recibir un Option<i32> y decir si hay valor o no
fn describir_opcion(valor: Option<i32>) -> String {
    // Tu código aquí usando match
    // Si hay valor: "Hay un valor: X"
    // Si no hay valor: "No hay valor"
    match valor {
        Some(t) => format!("Hay un valor: {}",t),
        None => "No hay valor".to_string()
        }
}

// Ejemplo de uso:
// describir_opcion(Some(42)) → "Hay un valor: 42"
// describir_opcion(None) → "No hay valor"

// =====================================

// 2. BUSCAR EN UNA LISTA
// Objetivo: Buscar un número en un vector y devolver su posición
fn buscar_numero(numeros: Vec<i32>, objetivo: i32) -> Option<usize> {
    // Tu código aquí
    // Pista: usa .iter().position(|&x| x == objetivo)
    numeros.iter().position(|&a| a==objetivo)
}

// Ejemplo de uso:
// let nums = vec![10, 20, 30, 40];
// buscar_numero(nums, 30) → Some(2)
// buscar_numero(nums, 99) → None

// =====================================

// 3. PROCESAR RESULTADO DE BÚSQUEDA
// Objetivo: Usar el resultado de buscar_numero y dar un mensaje
fn mensaje_busqueda(numeros: Vec<i32>, objetivo: i32) -> String {
    let posicion = buscar_numero(numeros, objetivo);
    // Tu código aquí usando match con el resultado
    // Si se encontró: "Encontrado en posición X"
    // Si no se encontró: "No se encontró el número X"
    match posicion {
        Some(p) => format!("Encontrado en posicion {}", p),
        None => format!("No se encontro el numero {}", objetivo)
    }
}

// Ejemplo de uso:
// let nums = vec![10, 20, 30];
// mensaje_busqueda(nums, 20) → "Encontrado en posición 1"
// mensaje_busqueda(nums, 99) → "No se encontró el número 99"

// =====================================

// 4. OBTENER PRIMER CARÁCTER
// Objetivo: Obtener el primer carácter de un string
fn primer_caracter(texto: &str) -> Option<char> {
    // Tu código aquí
    // Pista: usa texto.chars().next()
    texto.chars().next()
}

// Ejemplo de uso:
// primer_caracter("Hola") → Some('H')
// primer_caracter("") → None

// =====================================

// 5. PROCESAR PRIMER CARÁCTER
// Objetivo: Usar el primer carácter y decidir qué hacer
fn analizar_texto(texto: &str) -> String {
    // Tu código aquí usando match con primer_caracter(texto)
    // Si empieza con vocal (a,e,i,o,u): "Empieza con vocal: X"
    // Si empieza con consonante: "Empieza con consonante: X"
    // Si está vacío: "Texto vacío"
    let primer = primer_caracter(texto);
    match primer {
        Some(p) => {
            let p_lower = p.to_ascii_lowercase();
            if ['a', 'e', 'i', 'o', 'u'].contains(&p_lower) {
                format!("Empieza con vocal: {:?}", p)
            }else {
                format!("Empieza con consonante: {:?}", p)
            }
        }
        None => "Texti Vacío".to_string(),
    }
}

// Ejemplo de uso:
// analizar_texto("Hola") → "Empieza con consonante: H"
// analizar_texto("árbol") → "Empieza con vocal: á"
// analizar_texto("") → "Texto vacío"

// =====================================

// 6. DIVISIÓN SEGURA
// Objetivo: Dividir dos números, pero retornar None si divides por cero
fn dividir_seguro(a: i32, b: i32) -> Option<i32> {
    // Tu código aquí usando match o if
    // Si b == 0: None
    // Si no: Some(a / b)
    if b == 0 {
        None
    } else {
        Some(a/b)
    }
}

// Ejemplo de uso:
// dividir_seguro(10, 2) → Some(5)
// dividir_seguro(10, 0) → None

// =====================================

// 7. PROCESAR DIVISIÓN
// Objetivo: Usar el resultado de dividir_seguro y dar un mensaje apropiado
fn resultado_division(a: i32, b: i32) -> String {
    // Tu código aquí usando match con dividir_seguro(a, b)
    // Si hay resultado: "Resultado: X"
    // Si no se puede dividir: "Error: no se puede dividir por cero"
    let result = dividir_seguro(a, b);
    match result {
        Some(r) => format!("Resultado: {}", r),
        None => "Error: no se puede dividir por cero".to_string()
    }
}

// Ejemplo de uso:
// resultado_division(15, 3) → "Resultado: 5"
// resultado_division(15, 0) → "Error: no se puede dividir por cero"

// =====================================

// 8. MÚLTIPLES OPTIONS
// Objetivo: Sumar dos Option<i32>, solo si ambos tienen valor
fn sumar_opciones(a: Option<i32>, b: Option<i32>) -> Option<i32> {
    // Tu código aquí usando match
    // Solo si ambos son Some(x), retorna Some(x + y)
    // En cualquier otro caso, retorna None
    todo!()
}

// Ejemplo de uso:
// sumar_opciones(Some(5), Some(3)) → Some(8)
// sumar_opciones(Some(5), None) → None
// sumar_opciones(None, Some(3)) → None
// sumar_opciones(None, None) → None

// =====================================

// 9. CADENA DE OPTIONS
// Objetivo: Obtener el primer carácter de un texto y verificar si es dígito
fn primer_es_digito(texto: &str) -> String {
    // Tu código aquí usando match anidado o encadenado
    // 1. Obtén el primer carácter con primer_caracter(texto)
    // 2. Si hay carácter, verifica si es dígito con ch.is_ascii_digit()
    // Mensajes:
    // - Si es dígito: "Primer carácter es dígito: X"
    // - Si no es dígito: "Primer carácter no es dígito: X" 
    // - Si no hay primer carácter: "Texto vacío"
    todo!()
}

// Ejemplo de uso:
// primer_es_digito("123abc") → "Primer carácter es dígito: 1"
// primer_es_digito("abc123") → "Primer carácter no es dígito: a"
// primer_es_digito("") → "Texto vacío"

// =====================================

// 10. PARSING CON MATCH
// Objetivo: Intentar convertir un string a número
fn parsear_numero(texto: &str) -> Option<i32> {
    // Tu código aquí
    // Pista: usa texto.parse::<i32>()
    // Esto retorna Result<i32, _>, conviértelo a Option con .ok()
    todo!()
}

fn procesar_numero_texto(texto: &str) -> String {
    // Tu código aquí usando match con parsear_numero(texto)
    // Si se pudo parsear: "El número es: X"
    // Si no se pudo: "No es un número válido: X"
    todo!()
}

// Ejemplo de uso:
// procesar_numero_texto("42") → "El número es: 42"
// procesar_numero_texto("abc") → "No es un número válido: abc"

// =====================================

// 11. BONUS: MÚLTIPLES PATTERNS
// Objetivo: Clasificar números según su valor
fn clasificar_numero(numero: Option<i32>) -> String {
    // Tu código aquí usando match con múltiples patterns
    // Some(0) → "Es cero"
    // Some(x) if x > 0 → "Es positivo: X"
    // Some(x) if x < 0 → "Es negativo: X" 
    // None → "No hay número"
    todo!()
}

// Ejemplo de uso:
// clasificar_numero(Some(0)) → "Es cero"
// clasificar_numero(Some(5)) → "Es positivo: 5"
// clasificar_numero(Some(-3)) → "Es negativo: -3"
// clasificar_numero(None) → "No hay número"

// =====================================

// 12. SUPER BONUS: COMBINANDO TODO
// Objetivo: Procesar una lista de strings que podrían ser números
fn procesar_lista_numeros(textos: Vec<&str>) -> Vec<String> {
    // Tu código aquí combinando:
    // 1. .iter() para recorrer
    // 2. .map() para transformar cada string
    // 3. parsear_numero() para intentar convertir
    // 4. match para decidir qué mensaje dar
    // 5. .collect() para juntar los resultados
    
    // Para cada texto:
    // - Si se puede convertir a número par: "Par: X"
    // - Si se puede convertir a número impar: "Impar: X"  
    // - Si no se puede convertir: "Inválido: X"
    todo!()
}

// Ejemplo de uso:
// let textos = vec!["42", "abc", "17", "0", "xyz"];
// procesar_lista_numeros(textos) → [
//     "Par: 42",
//     "Inválido: abc", 
//     "Impar: 17",
//     "Par: 0",
//     "Inválido: xyz"
// ]

// =====================================
// TESTS PARA VERIFICAR TUS SOLUCIONES
// =====================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_describir_opcion() {
        assert_eq!(describir_opcion(Some(42)), "Hay un valor: 42");
        assert_eq!(describir_opcion(None), "No hay valor");
    }

    #[test]
    fn test_primer_caracter() {
        assert_eq!(primer_caracter("Hola"), Some('H'));
        assert_eq!(primer_caracter(""), None);
    }

    #[test]
    fn test_dividir_seguro() {
        assert_eq!(dividir_seguro(10, 2), Some(5));
        assert_eq!(dividir_seguro(10, 0), None);
    }

    #[test]
    fn test_sumar_opciones() {
        assert_eq!(sumar_opciones(Some(5), Some(3)), Some(8));
        assert_eq!(sumar_opciones(Some(5), None), None);
        assert_eq!(sumar_opciones(None, Some(3)), None);
        assert_eq!(sumar_opciones(None, None), None);
    }

    // Agrega más tests según vayas resolviendo...
}