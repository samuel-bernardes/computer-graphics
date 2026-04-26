// Código da questão 4

/**
 * Classe para manipulação de Vetores 2D
 */
class Vec4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w; // w=0 para vetores, w=1 para pontos
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    multiplyScalar(s) {
        return new Vec4(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    sum(v) {
        return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    // Cria um vetor a partir de dois pontos (ponto destino - ponto origem)
    // Se w de p1 e p2 forem 1 (pontos), 1 - 1 = 0 (resultado é um vetor)
    creationFromPoints(p1, p2) {
        return new Vec4(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z, p2.w - p1.w);
    }

    normalize() {
        const length = this.norm();
        if (length === 0) {
            return new Vec4(0, 0, 0, this.w);
        }
        return new Vec4(this.x / length, this.y / length, this.z / length, this.w);
    }

    // Produto escalar
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    // Produto vetorial
    cross(v) {
        return new Vec4(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
            0
        );
    }

    // Angulo entre dois vetores usando o produto escalar
    angleTo(v) {
        const dotProduct = this.dot(v); 
        const normsProduct = this.norm() * v.norm();
        
        if (normsProduct === 0) return 0;
        
        const cosTheta = dotProduct / normsProduct;

        // Limita o valor entre -1 e 1 para evitar erros de precisão do ponto flutuante no Math.acos
        return Math.acos(Math.min(Math.max(cosTheta, -1), 1));
    }

    // Combinação Afim -> P(t) = (1 - t)*P1 + t*P2
    affineCombination(v2, t) {
        return new Vec4(
            this.x * (1 - t) + v2.x * t,
            this.y * (1 - t) + v2.y * t,
            this.z * (1 - t) + v2.z * t,
            this.w * (1 - t) + v2.w * t
        );
    }
}

/**
 * Classe para manipulação de Matrizes 4x4 em coordenadas homogêneas (3D)
 */
class Mat4 {
    constructor() {
        this.elements = new Float32Array(16);
        this.identity(); 
    }
    
    /* Cria matriz identidade */
    identity() {
        this.elements.fill(0);
        this.elements[0] = 1;
        this.elements[5] = 1;
        this.elements[10] = 1;
        this.elements[15] = 1;
    }

    /* Operação de translação */
    translate(tx, ty, tz) {
        this.identity();
        this.elements[3] = tx;
        this.elements[7] = ty;
        this.elements[11] = tz;
    }

    /* Rotaciona no eixo Z */
    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.elements.fill(0);
        this.elements[0] = c;  this.elements[1] = -s;
        this.elements[4] = s;  this.elements[5] = c;  this.elements[10] = 1;
        this.elements[15] = 1;
    }

    /* Rotaciona no eixo Y */
    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.elements.fill(0);
        this.elements[0] = c;  this.elements[2] = s;
        this.elements[5] = 1;
        this.elements[8] = -s; this.elements[10] = c;
        this.elements[15] = 1;
    }

    /* Rotaciona no eixo X */
    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.elements.fill(0);
        this.elements[0] = 1;
        this.elements[5] = c;  this.elements[6] = -s;
        this.elements[9] = s;  this.elements[10] = c;
        this.elements[15] = 1;
    }

    /* Escala a matriz */
    scale(sx, sy, sz) {
        this.elements.fill(0);
        this.elements[0] = sx;
        this.elements[5] = sy;
        this.elements[10] = sz;
        this.elements[15] = 1;
    }

    // Multiplica a matriz atual por outra matriz B (this * B)
    multiply(B) {
        const result = new Mat4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.elements[i * 4 + j] =
                    this.elements[i * 4 + 0] * B.elements[0 * 4 + j] +
                    this.elements[i * 4 + 1] * B.elements[1 * 4 + j] +
                    this.elements[i * 4 + 2] * B.elements[2 * 4 + j] +
                    this.elements[i * 4 + 3] * B.elements[3 * 4 + j];
            }
        }
        return result;
    }

    /* Cria matriz de projeção ortográfica */
    ortho(left, right, bottom, top, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        this.elements.fill(0);
        this.elements[0] = -2 * lr; this.elements[3] = (left + right) * lr;
        this.elements[5] = -2 * bt; this.elements[7] = (top + bottom) * bt;
        this.elements[10] = 2 * nf; this.elements[11] = (far + near) * nf;
        this.elements[15] = 1;
    }

    /* Cria matriz de projeção em perspectiva */
    perspective(fov, aspect, near, far) {
        const f = 1 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        this.elements.fill(0);
        this.elements[0] = f / aspect;
        this.elements[5] = f;
        this.elements[10] = (far + near) * nf; this.elements[11] = (2 * far * near) * nf;
        this.elements[14] = -1;
    }

    /* Converte a matriz para um array de Float32Array */
    asFloat32Array() {
        const transposed = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                transposed[j * 4 + i] = this.elements[i * 4 + j];
            }
        }
        return transposed;
    }
}
